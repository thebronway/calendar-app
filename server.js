const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws'); 
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- Configuration ---
const PORT = process.env.PORT || 80;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DATA_DIR = path.join(__dirname, 'data');
const CLIENT_BUILD_PATH = path.join(__dirname, 'client/build');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Environment variable defaults (used only if config.json doesn't exist)
const DEFAULT_CONFIG = {
    headerStyle: 'simple', // 'simple', 'possessive', 'question'
    ownerName: '',
    timezone: process.env.TIMEZONE || 'UTC',
    bannerHtml: process.env.PAGE_BANNER_HTML || null
};

// In-memory store for valid admin tokens
const validAdmins = new Set();

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
    console.error('FATAL ERROR: ADMIN_PASSWORD environment variable is not set.');
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

    ws.on('error', (err) => console.error('WebSocket client error:', err));
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
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        } catch (e) {
            console.error("Error reading config, using defaults:", e);
        }
    }
    // Fallback to Env Vars / Defaults if file missing
    return DEFAULT_CONFIG;
};

// Config Writer
const writeConfig = (newConfig) => {
    ensureDataDir();
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error("Error writing config:", e);
        return false;
    }
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
    const message = JSON.stringify({
        type: 'DATA_UPDATE',
        payload: { year: year, data: data }
    });
    wss.clients.forEach((client) => {
        if (client.readyState === 1) client.send(message);
    });
};

const broadcastConfigUpdate = (config) => {
    const message = JSON.stringify({
        type: 'CONFIG_UPDATE',
        payload: config
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

// 3. Authentication
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = crypto.randomBytes(32).toString('hex');
        validAdmins.add(token);
        setTimeout(() => validAdmins.delete(token), 1000 * 60 * 60 * 8); 
        res.json({ role: 'admin', token: token });
    } else {
        res.status(401).json({ role: 'view', token: null });
    }
});

// 4. Get Data
app.get('/api/data/:year', (req, res) => {
    const { year } = req.params;
    const data = readData(year);
    res.json(data || {});
});

// 5. Save Data (Protected)
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