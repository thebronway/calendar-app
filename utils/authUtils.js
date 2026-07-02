const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const SECRET_FILE = path.join(DATA_DIR, '.jwt_secret');

let JWT_SECRET = process.env.JWT_SECRET;

// Implement persistent secure fallback if no env variable is provided
if (!JWT_SECRET) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(SECRET_FILE)) {
    JWT_SECRET = fs.readFileSync(SECRET_FILE, 'utf8').trim();
  } else {
    JWT_SECRET = crypto.randomBytes(64).toString('hex');
    fs.writeFileSync(SECRET_FILE, JWT_SECRET, 'utf8');
    console.info('Generated new persistent JWT secret.');
  }
}

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