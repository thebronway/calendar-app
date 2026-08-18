const express = require('express');
const jwt = require('jsonwebtoken');
const { readData, writeData } = require('../utils/fileOps');
const { verifyAdminToken, JWT_SECRET } = require('../utils/authUtils');
const { logError } = require('../utils/logger');

const router = express.Router();

const validateYear = (year) => {
  if (!/^\d{4}$/.test(year)) return null;
  const n = parseInt(year, 10);
  return n >= 1900 && n <= 2100 ? n : null;
};

router.get('/:year', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const { year } = req.params;
  const yearNum = validateYear(year);
  if (!yearNum) return res.status(400).json({ error: 'Invalid year' });
  
  const data = readData(yearNum) || {};
  
  if (data.dayData) {
    let isAdmin = false;
    const token = req.cookies?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'admin') isAdmin = true;
      } catch (err) {}
    }

    if (!isAdmin) {
      Object.keys(data.dayData).forEach(key => {
        if (data.dayData[key].isDraft) {
          data.dayData[key].colorId = 'none';
          data.dayData[key].icons = [];
          data.dayData[key].locations = '';
          data.dayData[key].details = '';
          delete data.dayData[key].isDraft;
        }
      });
    }
  }

  res.json(data);
});

router.post('/:year', verifyAdminToken, async (req, res) => {
  const { year } = req.params;
  const data = req.body;

  if (!data.dayData || !data.keyItems || data.lastUpdatedText === undefined) {
    logError('Data validation failed', new Error('Invalid data structure'), { year });
    return res.status(400).json({ error: 'Invalid data structure', details: 'Missing required fields' });
  }

  const yearNum = validateYear(year);
  if (!yearNum) {
    logError('Year validation failed', new Error('Invalid year parameter'), { year });
    return res.status(400).json({ error: 'Invalid year', details: 'Year must be a 4-digit number' });
  }

  if (await writeData(yearNum, data)) {
    if (req.app.locals.broadcastUpdate) {
      req.app.locals.broadcastUpdate(yearNum, data);
    }
    res.status(200).json({ success: true, message: 'Data saved successfully.' });
  } else {
    logError('Data write failed', new Error('Failed to write data file'), { year: yearNum });
    res.status(500).json({ error: 'Failed to save data', details: 'Internal server error' });
  }
});

module.exports = router;