const express = require('express');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const { logAuthAttempt, readAccess, readLogs } = require('../utils/fileOps');
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
  const { password } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 
    });
    logAuthAttempt(ip, 'success', 'admin', 'Master Admin');
    return res.json({ role: 'admin' });
  }

  const accessList = readAccess();
  const now = new Date();
  let matchedView = null;

  for (const access of accessList) {
    if (access.expiresAt && new Date(access.expiresAt) < now) continue; 
    if (verifyPassword(password, access.passwordHash)) {
      matchedView = access;
      break;
    }
  }

  if (matchedView) {
    const token = jwt.sign({ role: 'view' }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 
    });
    logAuthAttempt(ip, 'success', 'view', matchedView.name);
    return res.json({ role: 'view' });
  }

  logAuthAttempt(ip, 'failed', 'none', 'Unknown');
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