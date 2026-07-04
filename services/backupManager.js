const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const archiver = require('archiver');
const { logError } = require('../utils/logger');
const { DATA_DIR, readConfig } = require('../utils/fileOps');

const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
let activeCronTask = null;

const ensureBackupsDir = () => {
  if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
};

const getTimestampString = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('-Z')[0];
};

const cleanOldBackups = () => {
  ensureBackupsDir();
  const now = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  try {
    const folders = fs.readdirSync(BACKUPS_DIR);
    folders.forEach((folder) => {
      const folderPath = path.join(BACKUPS_DIR, folder);
      const stats = fs.statSync(folderPath);
      if (stats.isDirectory() && now - stats.mtimeMs > SEVEN_DAYS_MS) {
        fs.rmSync(folderPath, { recursive: true, force: true });
      }
    });
  } catch (err) {
    logError('Backup Cleanup', err);
  }
};

const createBackup = (backupType = 'auto') => {
  ensureBackupsDir();
  cleanOldBackups();

  let prefix = 'auto-backup_';
  if (backupType === 'snapshot') prefix = 'pre-restore-snapshot_';
  if (backupType === 'manual') prefix = 'manual-backup_';

  const backupFolderName = `${prefix}${getTimestampString()}`;
  const targetDir = path.join(BACKUPS_DIR, backupFolderName);

  try {
    fs.mkdirSync(targetDir);
    const files = fs.readdirSync(DATA_DIR);
    files.forEach((file) => {
      if (file.endsWith('.json')) {
        fs.copyFileSync(path.join(DATA_DIR, file), path.join(targetDir, file));
      }
    });
    return true;
  } catch (err) {
    logError('Backup Creation', err);
    return false;
  }
};

const restoreBackup = (backupName) => {
  const sourceDir = path.join(BACKUPS_DIR, backupName);
  if (!fs.existsSync(sourceDir)) throw new Error('Backup not found');

  // 1. Take a snapshot of the current state before overwriting
  createBackup('snapshot');

  // 2. Wipe current JSON files in DATA_DIR
  const files = fs.readdirSync(DATA_DIR);
  files.forEach((file) => {
    if (file.endsWith('.json')) fs.unlinkSync(path.join(DATA_DIR, file));
  });

  // 3. Copy files from the backup directory into DATA_DIR
  const backupFiles = fs.readdirSync(sourceDir);
  backupFiles.forEach((file) => {
    if (file.endsWith('.json')) {
      fs.copyFileSync(path.join(sourceDir, file), path.join(DATA_DIR, file));
    }
  });
};

const getBackupsList = () => {
  ensureBackupsDir();
  return fs.readdirSync(BACKUPS_DIR)
    .filter(f => fs.statSync(path.join(BACKUPS_DIR, f)).isDirectory())
    .map(f => {
      const stats = fs.statSync(path.join(BACKUPS_DIR, f));
      let type = 'auto';
      if (f.startsWith('pre-restore')) type = 'snapshot';
      if (f.startsWith('manual')) type = 'manual';

      return {
        id: f,
        name: f,
        timestamp: stats.mtime.toISOString(),
        type,
      };
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const streamDataAsZip = (res) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => { throw err; });
  archive.pipe(res);

  const files = fs.readdirSync(DATA_DIR);
  files.forEach((file) => {
    if (file.endsWith('.json')) {
      archive.file(path.join(DATA_DIR, file), { name: file });
    }
  });
  archive.finalize();
};

const initBackupScheduler = (overrideTz = null) => {
  if (activeCronTask) activeCronTask.stop();

  const config = readConfig();
  const tz = overrideTz || config.timezone || 'UTC';

  // Run at Midnight
  activeCronTask = cron.schedule('0 0 * * *', () => {
    console.info('Running nightly automated backup...');
    createBackup('auto');
  }, {
    timezone: tz,
  });
  
  console.info(`Nightly backup scheduler initialized for timezone: ${tz}`);
};

module.exports = {
  createBackup,
  restoreBackup,
  getBackupsList,
  streamDataAsZip,
  initBackupScheduler
};