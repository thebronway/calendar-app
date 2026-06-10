const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { rateLimit } = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { generateICalFeed } = require('./services/iCalGenerator');

// --- Configuration ---
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const CLIENT_BUILD_PATH = path.join(__dirname, 'client/build');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const FEEDS_FILE = path.join(DATA_DIR, 'feeds.json');

// Environment variable defaults (used only if config.json doesn't exist)
const DEFAULT_CONFIG = {
  headerStyle: 'simple', // 'simple', 'possessive', 'question'
  ownerName: '',
  timezone: process.env.TIMEZONE || 'UTC',
  bannerHtml: process.env.PAGE_BANNER_HTML || null,
  autoScrollMobile: true,
  autoScrollDesktop: false,
  collapseKeyMobile: true,
  collapseKeyDesktop: false,
  collapseStatsMobile: true,
  collapseStatsDesktop: false,
};

// Derived JWT secret from the admin password to ensure it survives reboots
const JWT_SECRET = crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD || 'default_fallback').digest('hex');

// File write locks per year to prevent concurrent writes
const writeLocks = new Map();

// --- Server Setup ---
const app = express();

app.set('trust proxy', 1);

const server = http.createServer(app);

// Initialize WebSocketServer explicitly
const wss = new WebSocketServer({
  server,
  clientTracking: true,
});

// --- Security Best Practice ---
if (!ADMIN_PASSWORD) {
  logError('Startup validation', new Error('ADMIN_PASSWORD environment variable is not set'));
  process.exit(1);
}

// --- WebSocket Handling ---

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  // console.log(`Client connected from ${clientIp}`); // Optional logging

  ws.isAlive = true;
  ws.on('pong', heartbeat);

  ws.on('error', (err) => logError('WebSocket client', err));
  ws.on('close', (code, reason) => {
    // console.log(`Client disconnected. Code: ${code}`); // Optional logging
  });
});

// WebSocket heartbeat interval (30s)
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', function close() {
  clearInterval(interval);
});

// --- Middleware ---
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(CLIENT_BUILD_PATH));

// Token Verification Middleware
const verifyAdminToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'admin') {
      req.user = decoded;
      next();
    } else {
      res.sendStatus(403);
    }
  } catch (err) {
    res.sendStatus(403);
  }
};

// --- Utility Functions ---
const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const getDataFilePath = (year) => {
  ensureDataDir();
  return path.join(DATA_DIR, `${year}_data.json`);
};

// Config Reader
const readConfig = () => {
  ensureDataDir();
  // 1. Start with defaults (which includes ENV vars like TIMEZONE and PAGE_BANNER_HTML)
  let finalConfig = { ...DEFAULT_CONFIG };

  // 2. Overlay saved config.json if it exists
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      finalConfig = { ...finalConfig, ...fileConfig };
    } catch (e) {
      logError('Config read', e);
    }
  }

  // 3. Force Docker ENV to override for the banner
  if (process.env.PAGE_BANNER_HTML) {
    finalConfig.bannerHtml = process.env.PAGE_BANNER_HTML;
  }

  return finalConfig;
};

// Config Writer
const writeConfig = (newConfig) => {
  ensureDataDir();
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf8');
    return true;
  } catch (e) {
    logError('Config write', e);
    return false;
  }
};

// Feeds Reader
const readFeeds = () => {
  ensureDataDir();
  if (fs.existsSync(FEEDS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(FEEDS_FILE, 'utf8'));
    } catch (e) {
      logError('Feeds read', e);
    }
  }
  return [];
};

// Feeds Writer
const writeFeeds = (feeds) => {
  ensureDataDir();
  try {
    fs.writeFileSync(FEEDS_FILE, JSON.stringify(feeds, null, 2), 'utf8');
    return true;
  } catch (e) {
    logError('Feeds write', e);
    return false;
  }
};

const readData = (year) => {
  const filePath = getDataFilePath(year);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      logError(`Data read for year ${year}`, e);
      return null;
    }
  }
  return null;
};

const writeData = async (year, data) => {
  const filePath = getDataFilePath(year);
  // Acquire lock for this year
  let release;
  const waitForLock = writeLocks.get(year);
  if (waitForLock) {
    await waitForLock;
  }
  const lockPromise = new Promise((resolve) => {
    release = resolve;
  });
  writeLocks.set(year, lockPromise);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    logError(`Data write for year ${year}`, e);
    return false;
  } finally {
    writeLocks.delete(year);
    release();
  }
};

const broadcastUpdate = (year, data) => {
  const message = JSON.stringify({
    type: 'DATA_UPDATE',
    payload: { year: year, data: data },
  });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
  });
};

const broadcastConfigUpdate = (config) => {
  const message = JSON.stringify({
    type: 'CONFIG_UPDATE',
    payload: config,
  });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
  });
};

// --- API Routes ---

// 1. Get App Configuration
app.get('/api/config', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(readConfig());
});

// 2. Save App Configuration (Protected)
app.post('/api/config', verifyAdminToken, (req, res) => {
  const newConfig = req.body;
  // Basic validation
  if (!newConfig.timezone) return res.status(400).send('Timezone is required');

  if (writeConfig(newConfig)) {
    broadcastConfigUpdate(newConfig);
    res.json(newConfig);
  } else {
    res.status(500).send('Failed to save config');
  }
});

// Rate limiter: max 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

// 3. Authentication
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ role: 'admin' });
  } else {
    res.status(401).json({ role: 'view' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ role: 'view' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ role: decoded.role });
  } catch (err) {
    res.clearCookie('token');
    res.json({ role: 'view' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Year validation helper
const validateYear = (year) => {
  if (!/^\d{4}$/.test(year)) return null;
  const n = parseInt(year, 10);
  return n >= 1900 && n <= 2100 ? n : null;
};

// 4. Get Data
app.get('/api/data/:year', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const { year } = req.params;
  const yearNum = validateYear(year);
  if (!yearNum) return res.status(400).json({ error: 'Invalid year' });
  const data = readData(yearNum);
  res.json(data || {});
});

// 5. Save Data (Protected)
app.post('/api/data/:year', verifyAdminToken, async (req, res) => {
  const { year } = req.params;
  const data = req.body;

  // Validate request data
  if (!data.dayData || !data.keyItems || data.lastUpdatedText === undefined) {
    logError('Data validation failed', new Error('Invalid data structure'), { year, hasDayData: !!data.dayData, hasKeyItems: !!data.keyItems, hasLastUpdatedText: data.lastUpdatedText !== undefined });
    return res.status(400).json({ error: 'Invalid data structure', details: 'Missing required fields: dayData, keyItems, or lastUpdatedText' });
  }

  // Validate year parameter (strict: 4 digits, 1900-2100)
  const yearNum = validateYear(year);
  if (!yearNum) {
    logError('Year validation failed', new Error('Invalid year parameter'), { year });
    return res.status(400).json({ error: 'Invalid year', details: 'Year must be a 4-digit number between 1900 and 2100' });
  }

  if (await writeData(yearNum, data)) {
    broadcastUpdate(yearNum, data);
    res.status(200).json({ success: true, message: 'Data saved successfully.' });
  } else {
    logError('Data write failed', new Error('Failed to write data file'), { year: yearNum });
    res.status(500).json({ error: 'Failed to save data', details: 'Internal server error' });
  }
});

// 6. iCal Feeds Management (Protected)
app.get('/api/feeds', verifyAdminToken, (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(readFeeds());
});

app.get('/api/feeds/public', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const feeds = readFeeds();
  const publicFeeds = feeds
    .filter(f => f.isPublic)
    .map(f => ({
      id: f.id,
      name: f.name,
      publicToken: f.publicToken,
      isPublic: true,
      triggerType: f.triggerType,
      dataTriggerMode: f.dataTriggerMode,
      dataLogicalOperator: f.dataLogicalOperator,
      selectedCategories: f.selectedCategories,
      selectedActivities: f.selectedActivities,
      locationMode: f.locationMode,
      selectedLocations: f.selectedLocations
    }));
  res.json(publicFeeds);
});

app.post('/api/feeds', verifyAdminToken, (req, res) => {
  const feeds = readFeeds();
  const newFeed = req.body;

  if (!newFeed.id) {
    // Create new feed
    newFeed.id = crypto.randomUUID();
    newFeed.token = crypto.randomBytes(16).toString('hex');
    if (newFeed.isPublic) {
      newFeed.publicToken = crypto.randomBytes(16).toString('hex');
    }
    feeds.push(newFeed);
  } else {
    // Update existing feed
    const index = feeds.findIndex(f => f.id === newFeed.id);
    if (index !== -1) {
      // Preserve the token (or generate a new one if somehow missing)
      newFeed.token = feeds[index].token || crypto.randomBytes(16).toString('hex');
      
      // Handle public token generation
      if (newFeed.isPublic) {
        newFeed.publicToken = feeds[index].publicToken || crypto.randomBytes(16).toString('hex');
      } else {
        newFeed.publicToken = undefined;
      }
      
      feeds[index] = newFeed;
    } else {
      return res.status(404).send('Feed not found');
    }
  }

  if (writeFeeds(feeds)) {
    res.json(newFeed);
  } else {
    res.status(500).send('Failed to save feeds');
  }
});

app.delete('/api/feeds/:id', verifyAdminToken, (req, res) => {
  let feeds = readFeeds();
  const initialLength = feeds.length;
  feeds = feeds.filter(f => f.id !== req.params.id);
  
  if (feeds.length === initialLength) {
    return res.status(404).send('Feed not found');
  }

  if (writeFeeds(feeds)) {
    res.status(200).send('Feed deleted');
  } else {
    res.status(500).send('Failed to delete feed');
  }
});

// 7. Public iCal Feed Route
app.get('/api/feed/:token', async (req, res) => {
  const feeds = readFeeds();
  const profile = feeds.find(f => f.token === req.params.token || (f.isPublic && f.publicToken === req.params.token));

  if (!profile) {
    return res.status(404).send('Invalid feed token');
  }

  try {
    const icalString = await generateICalFeed(profile, DATA_DIR);
    
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="calendar-${profile.id}.ics"`);
    res.send(icalString);
  } catch (error) {
    logError(`Feed generation failed for token ${req.params.token}`, error);
    res.status(500).send('Failed to generate calendar feed');
  }
});

// --- Serve React App ---
// Catch-all route to serve the React app for client-side routing
app.get('/*', (req, res) => {
  res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

// --- Error handling helper ---
const logError = (context, error, additionalData = {}) => {
  console.error(`[ERROR] ${context}:`, {
    message: error.message,
    stack: error.stack,
    ...additionalData,
    timestamp: new Date().toISOString(),
  });
};

// --- Global error handlers ---
process.on('uncaughtException', (error) => {
  logError('Uncaught Exception', error);
  // Don't exit immediately, let the server try to continue
  console.error('Uncaught Exception occurred, but continuing...');
});

process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection', new Error('Unhandled Promise Rejection'), { reason });
});

// --- Start Server ---
server.listen(PORT, () => {
  console.info(`Server is running on port ${PORT}`);
  console.info(`Serving static files from: ${CLIENT_BUILD_PATH}`);
  console.info('WebSocket server is running.');
});
