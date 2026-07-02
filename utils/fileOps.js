const fs = require('fs');
const path = require('path');
const { logError } = require('./logger');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const FEEDS_FILE = path.join(DATA_DIR, 'feeds.json');
const ACCESS_FILE = path.join(DATA_DIR, 'access.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

const DEFAULT_CONFIG = {
  headerStyle: 'simple',
  ownerName: '',
  timezone: process.env.TIMEZONE || 'UTC',
  bannerHtml: process.env.PAGE_BANNER_HTML || null,
  autoScrollMobile: true,
  autoScrollDesktop: false,
  collapseKeyMobile: true,
  collapseKeyDesktop: false,
  collapseStatsMobile: true,
  collapseStatsDesktop: false,
  viewMode: 'public',
  sessionTimeout: 24,
  statsVisibility: 'all',
};

// File write locks per year to prevent concurrent writes
const writeLocks = new Map();

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const getDataFilePath = (year) => {
  ensureDataDir();
  return path.join(DATA_DIR, `${year}_data.json`);
};

const readConfig = () => {
  ensureDataDir();
  let finalConfig = { ...DEFAULT_CONFIG };
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      finalConfig = { ...finalConfig, ...fileConfig };
    } catch (e) {
      logError('Config read', e);
    }
  }
  if (process.env.PAGE_BANNER_HTML) {
    finalConfig.bannerHtml = process.env.PAGE_BANNER_HTML;
  }
  return finalConfig;
};

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

const readFeeds = () => {
  ensureDataDir();
  if (fs.existsSync(FEEDS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(FEEDS_FILE, 'utf8'));
    } catch (e) {
      logError('Feeds read', e);
    }
  }
  return [];
};

const writeFeeds = (feeds) => {
  ensureDataDir();
  try {
    fs.writeFileSync(FEEDS_FILE, JSON.stringify(feeds, null, 2), 'utf8');
    return true;
  } catch (e) {
    logError('Feeds write', e);
    return false;
  }
};

const readAccess = () => {
  ensureDataDir();
  if (fs.existsSync(ACCESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ACCESS_FILE, 'utf8'));
    } catch (e) {
      logError('Access read', e);
    }
  }
  return [];
};

const writeAccess = (accessList) => {
  ensureDataDir();
  try {
    fs.writeFileSync(ACCESS_FILE, JSON.stringify(accessList, null, 2), 'utf8');
    return true;
  } catch (e) {
    logError('Access write', e);
    return false;
  }
};

const readLogs = () => {
  ensureDataDir();
  if (fs.existsSync(LOGS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
    } catch (e) {
      logError('Logs read', e);
    }
  }
  return [];
};

const logAuthAttempt = (ip, status, role, accountName) => {
  const logs = readLogs();
  logs.unshift({
    timestamp: new Date().toISOString(),
    ip: ip || 'unknown',
    status,
    role,
    accountName
  });
  if (logs.length > 500) logs.length = 500;
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch (e) {
    logError('Log write', e);
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

module.exports = {
  DATA_DIR,
  readConfig,
  writeConfig,
  readFeeds,
  writeFeeds,
  readAccess,
  writeAccess,
  readLogs,
  logAuthAttempt,
  readData,
  writeData
};