const express = require('express');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const { logAuthAttempt, readAccess, readLogs, readConfig } = require('../utils/fileOps');
const { ADMIN_PASSWORD, JWT_SECRET, verifyPassword, verifyAdminToken } = require('../utils/authUtils');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

router.post('/login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!username || !password) {
    logAuthAttempt(ip, 'failed', 'none', username || 'Unknown');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const config = readConfig();
  const timeoutHours = config.sessionTimeout || 24;

  // --- DEMO MODE INTERCEPTOR ---
  if (process.env.DEMO_MODE === 'true') {
    const demoAdminPass = process.env.DEMO_ADMIN_PASSWORD || 'admin';
    const demoGuestPass = process.env.DEMO_GUEST_PASSWORD || 'guest';

    if (username.toLowerCase() === 'admin' && password === demoAdminPass) {
      const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: `${timeoutHours}h` });
      res.cookie('token', token, { httpOnly: true, secure: req.secure || req.headers['x-forwarded-proto'] === 'https', sameSite: 'strict', maxAge: timeoutHours * 60 * 60 * 1000 });
      logAuthAttempt(ip, 'success', 'admin', 'Demo Admin');
      return res.json({ role: 'admin' });
    }

    if (username.toLowerCase() === 'guest' && password === demoGuestPass) {
      const token = jwt.sign({ role: 'view' }, JWT_SECRET, { expiresIn: `${timeoutHours}h` });
      res.cookie('token', token, { httpOnly: true, secure: req.secure || req.headers['x-forwarded-proto'] === 'https', sameSite: 'strict', maxAge: timeoutHours * 60 * 60 * 1000 });
      logAuthAttempt(ip, 'success', 'view', 'Demo Guest');
      return res.json({ role: 'view' });
    }
  }
  // -----------------------------

  // 1. Check for Master Admin
  if (username.toLowerCase() === 'admin' && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: `${timeoutHours}h` });
    res.cookie('token', token, {
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'strict',
      maxAge: timeoutHours * 60 * 60 * 1000 
    });
    logAuthAttempt(ip, 'success', 'admin', 'Master Admin');
    return res.json({ role: 'admin' });
  }

  // 2. Targeted lookup for View Profiles
  const accessList = readAccess();
  const now = new Date();
  
  const matchedView = accessList.find(a => a.name.toLowerCase() === username.toLowerCase());

  if (matchedView) {
    if (matchedView.expiresAt && new Date(matchedView.expiresAt) < now) {
       // Profile is expired, fall through to generic error
    } else if (verifyPassword(password, matchedView.passwordHash)) {
      const token = jwt.sign({ role: 'view' }, JWT_SECRET, { expiresIn: `${timeoutHours}h` });
      res.cookie('token', token, {
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: 'strict',
        maxAge: timeoutHours * 60 * 60 * 1000 
      });
      logAuthAttempt(ip, 'success', 'view', matchedView.name);
      return res.json({ role: 'view' });
    }
  }

  // Generic error to prevent account enumeration
  logAuthAttempt(ip, 'failed', 'none', username);
  res.status(401).json({ error: 'Unauthorized' });
});

router.get('/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ role: 'none' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ role: decoded.role });
  } catch (err) {
    res.clearCookie('token');
    res.json({ role: 'none' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

router.get('/logs', verifyAdminToken, (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(readLogs());
});

module.exports = router;