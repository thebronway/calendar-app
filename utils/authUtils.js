const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
// Derived JWT secret from the admin password to ensure it survives reboots
const JWT_SECRET = crypto.createHash('sha256').update(ADMIN_PASSWORD || 'default_fallback').digest('hex');

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return key === hash;
  } catch (e) {
    return false;
  }
};

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

module.exports = {
  ADMIN_PASSWORD,
  JWT_SECRET,
  hashPassword,
  verifyPassword,
  verifyAdminToken
};