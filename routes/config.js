const express = require('express');
const { readConfig, writeConfig } = require('../utils/fileOps');
const { verifyAdminToken } = require('../utils/authUtils');

const router = express.Router();

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(readConfig());
});

const { initBackupScheduler } = require('../services/backupManager');

router.post('/', verifyAdminToken, (req, res) => {
  const newConfig = req.body;
  if (!newConfig.timezone) return res.status(400).send('Timezone is required');

  if (writeConfig(newConfig)) {
    // Restart the cron schedule if the timezone changes
    initBackupScheduler(newConfig.timezone);

    if (req.app.locals.broadcastConfigUpdate) {
      req.app.locals.broadcastConfigUpdate(newConfig);
    }
    res.json(newConfig);
  } else {
    res.status(500).send('Failed to save config');
  }
});

module.exports = router;