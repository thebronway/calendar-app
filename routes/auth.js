const express = require('express');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const { logAuthAttempt, readAccess, readLogs, readConfig } = require('../utils/fileOps');
const { ADMIN_PASSWORD, JWT_SECRET, verifyPassword, verifyAdminToken } = require('../utils/authUtils');
const { authenticateUser } = require('../services/identity/identityManager');
const { testLdapConnection } = require('../services/identity/ldapProvider');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

router.post('/login', authLimiter, async (req, res) => {
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

  // Hand off to the Decoupled Identity Manager
  const activeProvider = config.authProvider || 'local';
  const authResult = await authenticateUser(username, password, activeProvider);

  if (authResult.success) {
    const token = jwt.sign({ role: authResult.role }, JWT_SECRET, { expiresIn: `${timeoutHours}h` });
    res.cookie('token', token, {
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'strict',
      maxAge: timeoutHours * 60 * 60 * 1000 
    });
    logAuthAttempt(ip, 'success', authResult.role, authResult.accountName);
    return res.json({ role: authResult.role });
  } else {
    logAuthAttempt(ip, 'failed', 'none', username);
    res.status(401).json({ error: authResult.error || 'Unauthorized' });
  }
});

router.post('/test-ldap', verifyAdminToken, async (req, res) => {
  const configPayload = req.body;
  try {
    const result = await testLdapConnection(configPayload);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'LDAP connection failed.' });
  }
});

// Secure endpoint to re-verify master admin password before sensitive config changes
router.post('/verify-admin', verifyAdminToken, (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  return res.status(401).json({ error: 'Invalid admin password' });
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