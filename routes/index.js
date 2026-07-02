const express = require('express');
const configRoutes = require('./config');
const authRoutes = require('./auth');
const accessRoutes = require('./access');
const dataRoutes = require('./data');
const feedRoutes = require('./feeds');

const router = express.Router();

router.use('/config', configRoutes);
router.use('/auth', authRoutes);
router.use('/access', accessRoutes);
router.use('/data', dataRoutes);

// We mount feedRoutes at both /feeds and /feed to preserve your existing URLs 
// (The external extraction route is inside feeds.js as well)
router.use('/feeds', feedRoutes);
router.get('/feed/:token', (req, res, next) => {
  // Reroute /api/feed/:token to the external handler in feeds.js
  req.url = `/external/${req.params.token}`;
  feedRoutes(req, res, next);
});

module.exports = router;