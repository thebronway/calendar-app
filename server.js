const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- Configuration ---
// FIX: Default port is now 80, as requested
const PORT = process.env.PORT || 80;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DATA_DIR = path.join(__dirname, 'data');
const CLIENT_BUILD_PATH = path.join(__dirname, 'client/build');
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString('hex');

// NEW: Environment variable defaults
const PAGE_HEADER_NAME = process.env.PAGE_HEADER_NAME || null; // Default to null, client will handle
const TIMEZONE = process.env.TIMEZONE || 'UTC';

// In-memory store for valid admin tokens
const validAdmins = new Set();

// --- Server Setup ---
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// --- Security Best Practice ---
if (!ADMIN_PASSWORD) {
    console.error('FATAL ERROR: ADMIN_PASSWORD environment variable is not set.');
    console.error('The application will not start. Set this variable to a secure password when running the container.');
    process.exit(1); // Exit with a failure code
}

// --- WebSocket Handling ---

// NEW: Heartbeat function. 'this' will be the ws client
function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // NEW: Handle heartbeat
    ws.isAlive = true;
    ws.on('pong', heartbeat); // The browser will auto-reply to pings

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// NEW: WebSocket heartbeat interval
// This will run every 30 seconds to check all connections
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      console.log('Terminating dead WebSocket connection.');
      return ws.terminate();
    }

    ws.isAlive = false; // Assume it's dead, will be set to true by the 'pong'
    ws.ping(); // Send the ping
  });
}, 30000); // 30,000 milliseconds = 30 seconds

// NEW: Clear the interval on server close
wss.on('close', function close() {
  clearInterval(interval);
});

// --- Middleware ---
app.use(express.json()); // Parse JSON bodies
app.use(express.static(CLIENT_BUILD_PATH)); // Serve the static React app

// Token Verification Middleware
const verifyAdminToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <TOKEN>

    if (token == null) {
        return res.sendStatus(401); // No token
    }

    if (validAdmins.has(token)) {
        next(); // Token is valid, proceed
    } else {
        return res.sendStatus(403); // Invalid token
    }
};

// --- Utility Functions ---
const getDataFilePath = (year) => {
    // Ensure the data directory exists
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return path.join(DATA_DIR, `${year}_data.json`);
};

const readData = (year) => {
    const filePath = getDataFilePath(year);
    if (fs.existsSync(filePath)) {
        try {
            const fileData = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(fileData);
        } catch (e) {
            console.error(`Error reading data file for year ${year}:`, e);
            return null; // Return null if file is corrupt
        }
    }
    return null; // Return null if file doesn't exist
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
    console.log(`Broadcasting update for year ${year}`);
    const message = JSON.stringify({
        type: 'DATA_UPDATE',
        payload: {
            year: year,
            data: data
        }
    });

    wss.clients.forEach((client) => {
        // Use the raw value '1' for OPEN state
        if (client.readyState === 1) {
            client.send(message);
        }
    });
};

// --- API Routes ---

// 1. NEW: Get App Configuration
app.get('/api/config', (req, res) => {
    res.json({
        headerName: PAGE_HEADER_NAME,
        timezone: TIMEZONE
    });
});

// 2. Authentication
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        // Generate a simple, secure token
        const token = crypto.randomBytes(32).toString('hex');
        validAdmins.add(token); // Store it as a valid session
        
        // Optionally, make tokens expire
        setTimeout(() => {
            validAdmins.delete(token);
        }, 1000 * 60 * 60 * 8); // 8-hour session

        res.json({ role: 'admin', token: token });
    } else {
        res.status(401).json({ role: 'view', token: null });
    }
});

// 3. Get Data
app.get('/api/data/:year', (req, res) => {
    const { year } = req.params;
    const data = readData(year);
    if (data) {
        res.json(data);
    } else {
        // If no data, return empty object (client will initialize)
        res.json({}); 
    }
});

// 4. Save Data (Protected)
app.post('/api/data/:year', verifyAdminToken, (req, res) => {
    const { year } = req.params;
    const data = req.body;

    // Updated to check for new data structure
    if (!data.dayData || !data.keyItems || data.lastUpdatedText === undefined) {
        return res.status(400).send('Invalid data structure.');
    }

    // NEW: Validate a sample day object to ensure it has the new structure
    // This prevents saving malformed data from an old client
    const sampleKey = Object.keys(data.dayData)[0];
    if (sampleKey) {
        const sampleDay = data.dayData[sampleKey];
        if (sampleDay.details === undefined || sampleDay.locations === undefined) {
            console.warn('Blocking save: Data is in an old, invalid format.');
            return res.status(400).send('Invalid data structure. Client may be out of date.');
        }
    }

    if (writeData(year, data)) {
        // Broadcast the update to all connected clients
        broadcastUpdate(parseInt(year), data);
        res.status(200).send('Data saved successfully.');
    } else {
        res.status(500).send('Error saving data to file.');
    }
});

// --- Serve React App ---
// This catch-all route ensures that all non-API requests are
// served the React app, allowing client-side routing to work.
app.get('*', (req, res) => {
    res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

// --- Start Server ---
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Serving static files from: ${CLIENT_BUILD_PATH}`);
    console.log('WebSocket server is running.');
});
