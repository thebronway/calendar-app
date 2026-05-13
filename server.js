const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { rateLimit } = require('express-rate-limit');

// --- Configuration ---
const PORT = process.env.PORT || 80;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const CLIENT_BUILD_PATH = path.join(__dirname, 'client/build');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Environment variable defaults (used only if config.json doesn't exist)
const DEFAULT_CONFIG = {
  headerStyle: 'simple', // 'simple', 'possessive', 'question'
  ownerName: '',
  timezone: process.env.TIMEZONE || 'UTC',
  bannerHtml: process.env.PAGE_BANNER_HTML || null,
};

// In-memory store for valid admin tokens
const validAdmins = new Set();

// File write locks per year to prevent concurrent writes
const writeLocks = new Map();

// --- Server Setup ---
const app = express();
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
app.use(express.json());
app.use(express.static(CLIENT_BUILD_PATH));

// Token Verification Middleware
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  if (validAdmins.has(token)) next();
  else return res.sendStatus(403);
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

// Rate limiter: max 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

// 3. Authentication
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(32).toString('hex');
    validAdmins.add(token);
    // Token expires after 24 hours (86,400,000 ms)
    setTimeout(() => validAdmins.delete(token), 1000 * 60 * 60 * 24);
    res.json({ role: 'admin', token: token });
  } else {
    res.status(401).json({ role: 'view', token: null });
  }
});

// Year validation helper
const validateYear = (year) => {
  if (!/^\d{4}$/.test(year)) return null;
  const n = parseInt(year, 10);
  return n >= 1900 && n <= 2100 ? n : null;
};

// 4. Get Data
app.get('/api/data/:year', (req, res) => {
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

// --- Serve React App ---
// Note: Express 5 requires named wildcard params. '/{*splat}' is compatible
// with both Express 4 (via the @4 pin) and Express 5.
app.get('/{*splat}', (req, res) => {
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
