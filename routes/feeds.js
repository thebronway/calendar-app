const express = require('express');
const crypto = require('crypto');
const { readFeeds, writeFeeds, DATA_DIR } = require('../utils/fileOps');
const { verifyAdminToken } = require('../utils/authUtils');
const { generateICalFeed } = require('../services/iCalGenerator');
const { logError } = require('../utils/logger');

const router = express.Router();

router.get('/', verifyAdminToken, (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(readFeeds());
});

router.get('/public', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const feeds = readFeeds();
  const publicFeeds = feeds
    .filter(f => f.isPublic)
    .map(f => ({
      id: f.id,
      name: f.name,
      publicToken: f.publicToken,
      isPublic: true,
      triggerType: f.triggerType,
      dataTriggerMode: f.dataTriggerMode,
      dataLogicalOperator: f.dataLogicalOperator,
      selectedCategories: f.selectedCategories,
      selectedActivities: f.selectedActivities,
      locationMode: f.locationMode,
      selectedLocations: f.selectedLocations
    }));
  res.json(publicFeeds);
});

router.post('/', verifyAdminToken, (req, res) => {
  const feeds = readFeeds();
  const newFeed = req.body;

  if (!newFeed.id) {
    newFeed.id = crypto.randomUUID();
    newFeed.token = crypto.randomBytes(16).toString('hex');
    if (newFeed.isPublic) {
      newFeed.publicToken = crypto.randomBytes(16).toString('hex');
    }
    feeds.push(newFeed);
  } else {
    const index = feeds.findIndex(f => f.id === newFeed.id);
    if (index !== -1) {
      newFeed.token = feeds[index].token || crypto.randomBytes(16).toString('hex');
      if (newFeed.isPublic) {
        newFeed.publicToken = feeds[index].publicToken || crypto.randomBytes(16).toString('hex');
      } else {
        newFeed.publicToken = undefined;
      }
      feeds[index] = newFeed;
    } else {
      return res.status(404).send('Feed not found');
    }
  }

  if (writeFeeds(feeds)) {
    res.json(newFeed);
  } else {
    res.status(500).send('Failed to save feeds');
  }
});

router.delete('/:id', verifyAdminToken, (req, res) => {
  let feeds = readFeeds();
  const initialLength = feeds.length;
  feeds = feeds.filter(f => f.id !== req.params.id);
  
  if (feeds.length === initialLength) {
    return res.status(404).send('Feed not found');
  }

  if (writeFeeds(feeds)) {
    res.status(200).send('Feed deleted');
  } else {
    res.status(500).send('Failed to delete feed');
  }
});

// Used for the unauthenticated external extraction route
router.get('/external/:token', async (req, res) => {
  const feeds = readFeeds();
  const profile = feeds.find(f => f.token === req.params.token || (f.isPublic && f.publicToken === req.params.token));

  if (!profile) {
    return res.status(404).send('Invalid feed token');
  }

  try {
    const icalString = await generateICalFeed(profile, DATA_DIR);
    
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="calendar-${profile.id}.ics"`);
    res.send(icalString);
  } catch (error) {
    logError(`Feed generation failed for token ${req.params.token}`, error);
    res.status(500).send('Failed to generate calendar feed');
  }
});

module.exports = router;