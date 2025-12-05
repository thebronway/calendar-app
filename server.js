const express = require('express');
const http = require('http');
// Update: Destructure WebSocketServer for v8+ compatibility
const { WebSocketServer } = require('ws'); 
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- Configuration ---
const PORT = process.env.PORT || 80;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DATA_DIR = path.join(__dirname, 'data');
const CLIENT_BUILD_PATH = path.join(__dirname, 'client/build');

// Environment variable defaults
const PAGE_HEADER_NAME = process.env.PAGE_HEADER_NAME || null; 
const TIMEZONE = process.env.TIMEZONE || 'UTC';
const PAGE_BANNER_HTML = process.env.PAGE_BANNER_HTML || null; 

// In-memory store for valid admin tokens
const validAdmins = new Set();

// --- Server Setup ---
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ 
    server,
    clientTracking: true,
});

// --- Security Best Practice ---
if (!ADMIN_PASSWORD) {
    console.error('FATAL ERROR: ADMIN_PASSWORD environment variable is not set.');
    process.exit(1); 
}

// --- WebSocket Handling ---

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws, req) => {
    // Log the origin to debug connection issues
    const clientIp = req.socket.remoteAddress;
    console.log(`Client connected to WebSocket from ${clientIp}`);
    
    ws.isAlive = true;
    ws.on('pong', heartbeat); 

    ws.on('error', (err) => {
        console.error('WebSocket client error:', err);
    });

    ws.on('close', (code, reason) => {
        console.log(`Client disconnected. Code: ${code}, Reason: ${reason}`);
    });
});

// WebSocket heartbeat interval (30s)
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      console.log('Terminating dead WebSocket connection.');
      return ws.terminate();
    }

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

    if (validAdmins.has(token)) {
        next(); 
    } else {
        return res.sendStatus(403); 
    }
};

// --- Utility Functions ---
const getDataFilePath = (year) => {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return path.join(DATA_DIR, `${year}_data.json`);
};

const readData = (year) => {
    const filePath = getDataFilePath(year);
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.error(`Error reading data file for year ${year}:`, e);
            return null; 
        }
    }
    return null; 
};

const writeData = (year, data) => {
    const filePath = getDataFilePath(year);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error(`Error writing data file for year ${year}:`, e);
        return false;
    }
};

const broadcastUpdate = (year, data) => {
    // Console log removed to reduce noise, usually only needed for debugging
    // console.log(`Broadcasting update for year ${year}`);
    const message = JSON.stringify({
        type: 'DATA_UPDATE',
        payload: { year: year, data: data }
    });

    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
        }
    });
};

// --- API Routes ---

// 1. Get App Configuration
app.get('/api/config', (req, res) => {
    res.json({
        headerName: PAGE_HEADER_NAME,
        timezone: TIMEZONE,
        bannerHtml: PAGE_BANNER_HTML 
    });
});

// 2. Authentication
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = crypto.randomBytes(32).toString('hex');
        validAdmins.add(token);
        
        // 8-hour session
        setTimeout(() => validAdmins.delete(token), 1000 * 60 * 60 * 8); 

        res.json({ role: 'admin', token: token });
    } else {
        res.status(401).json({ role: 'view', token: null });
    }
});

// 3. Get Data
app.get('/api/data/:year', (req, res) => {
    const { year } = req.params;
    const data = readData(year);
    res.json(data || {});
});

// 4. Save Data (Protected)
app.post('/api/data/:year', verifyAdminToken, (req, res) => {
    const { year } = req.params;
    const data = req.body;

    if (!data.dayData || !data.keyItems || data.lastUpdatedText === undefined) {
        return res.status(400).send('Invalid data structure.');
    }

    if (writeData(year, data)) {
        broadcastUpdate(parseInt(year), data);
        res.status(200).send('Data saved successfully.');
    } else {
        res.status(500).send('Error saving data to file.');
    }
});

// --- Serve React App ---
app.get('*', (req, res) => {
    res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

// --- Start Server ---
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Serving static files from: ${CLIENT_BUILD_PATH}`);
    console.log('WebSocket server is running.');
});