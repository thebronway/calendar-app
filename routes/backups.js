const express = require('express');
const { verifyAdminToken } = require('../utils/authUtils');
const { getBackupsList, restoreBackup, streamDataAsZip, createBackup } = require('../services/backupManager');
const { logError } = require('../utils/logger');

const router = express.Router();

router.get('/', verifyAdminToken, (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(getBackupsList());
});

router.post('/manual', verifyAdminToken, (req, res) => {
  try {
    const success = createBackup('manual');
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to create manual backup' });
    }
  } catch (err) {
    logError('Manual Backup', err);
    res.status(500).json({ error: 'Failed to create manual backup' });
  }
});

router.post('/restore', verifyAdminToken, (req, res) => {
  const { backupName } = req.body;
  if (!backupName) return res.status(400).json({ error: 'Backup name is required' });

  try {
    restoreBackup(backupName);
    
    if (req.app.locals.broadcastForceReload) {
      req.app.locals.broadcastForceReload();
    }
    
    res.json({ success: true });
  } catch (err) {
    logError('Restore Backup', err);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

router.get('/download', verifyAdminToken, (req, res) => {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="calendar_data_backup_${new Date().toISOString().split('T')[0]}.zip"`);
  
  try {
    streamDataAsZip(res);
  } catch (err) {
    logError('Download Data Zip', err);
    if (!res.headersSent) res.status(500).send('Failed to generate zip');
  }
});

module.exports = router;