const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const cookieParser = require('cookie-parser');
const { logError } = require('./utils/logger');
const apiRoutes = require('./routes/index');
const jwt = require('jsonwebtoken');
const { ADMIN_PASSWORD, JWT_SECRET } = require('./utils/authUtils');
const { startDemoMode } = require('./utils/demoManager');

const PORT = process.env.PORT || 3000;
const CLIENT_BUILD_PATH = path.join(__dirname, 'client/build');

// --- Security Best Practice ---
if (!ADMIN_PASSWORD) {
  logError('Startup validation', new Error('ADMIN_PASSWORD environment variable is not set'));
  process.exit(1);
}

// --- Server Setup ---
const app = express();
app.set('trust proxy', 1);

const server = http.createServer(app);

// Initialize WebSocketServer explicitly
const wss = new WebSocketServer({
  server,
  clientTracking: true,
});

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  ws.role = 'none';

  // Parse JWT from cookie to secure WebSocket payloads
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((res, c) => {
      const parts = c.trim().split('=');
      const key = decodeURIComponent(parts.shift());
      const val = decodeURIComponent(parts.join('=')); // Safely re-join base64 padding
      return Object.assign(res, { [key]: val });
    }, {});
    
    if (cookies.token) {
      try {
        const decoded = jwt.verify(cookies.token, JWT_SECRET);
        ws.role = decoded.role;
      } catch (e) {}
    }
  }

  ws.on('pong', heartbeat);
  ws.on('error', (err) => logError('WebSocket client', err));
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

// --- Attach WebSocket Broadcasters to Express Locals ---
app.locals.broadcastUpdate = (year, data) => {
  const adminPayload = { type: 'DATA_UPDATE', payload: { year, data } };
  
  // Scrub draft data for non-admins
  const scrubbedData = JSON.parse(JSON.stringify(data));
  if (scrubbedData.dayData) {
    Object.keys(scrubbedData.dayData).forEach(key => {
      if (scrubbedData.dayData[key].isDraft) {
        scrubbedData.dayData[key].colorId = 'none';
        scrubbedData.dayData[key].icons = [];
        scrubbedData.dayData[key].locations = '';
        scrubbedData.dayData[key].details = '';
        delete scrubbedData.dayData[key].isDraft;
      }
    });
  }
  const viewPayload = { type: 'DATA_UPDATE', payload: { year, data: scrubbedData } };

  const adminMessage = JSON.stringify(adminPayload);
  const viewMessage = JSON.stringify(viewPayload);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      if (client.role === 'admin') {
        client.send(adminMessage);
      } else {
        client.send(viewMessage);
      }
    }
  });
};

app.locals.broadcastConfigUpdate = (config) => {
  const message = JSON.stringify({ type: 'CONFIG_UPDATE', payload: config });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
  });
};

app.locals.broadcastForceReload = () => {
  const message = JSON.stringify({ type: 'FORCE_RELOAD' });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
  });
};

// --- Middleware ---
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(express.static(CLIENT_BUILD_PATH));

// --- API Routes ---
app.use('/api', apiRoutes);

// --- Serve React App ---
// Catch-all route to serve the React app for client-side routing
app.get('/*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

// --- Global error handlers ---
process.on('uncaughtException', (error) => {
  logError('Uncaught Exception', error);
  console.error('Uncaught Exception occurred, but continuing...');
});

process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection', new Error('Unhandled Promise Rejection'), { reason });
});

// --- Start Demo Mode (If Enabled) ---
startDemoMode();

// --- Initialize Backup Scheduler ---
const { initBackupScheduler } = require('./services/backupManager');
initBackupScheduler();

// --- Start Server ---
server.listen(PORT, () => {
  console.info(`Server is running on port ${PORT}`);
  console.info(`Serving static files from: ${CLIENT_BUILD_PATH}`);
  console.info('WebSocket server is running.');
});