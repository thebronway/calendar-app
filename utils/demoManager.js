const fs = require('fs');
const path = require('path');
const { logError } = require('./logger');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const SEED_DIR = path.join(DATA_DIR, 'demo_seed');

const startDemoMode = () => {
  if (process.env.DEMO_MODE !== 'true') return;

  console.info('DEMO MODE ENABLED: Creating initial seed snapshot...');

  try {
    if (!fs.existsSync(SEED_DIR)) {
      fs.mkdirSync(SEED_DIR, { recursive: true });
    }

    // Check if seed files already exist (e.g., from a previous boot or a mounted volume)
    const existingSeedFiles = fs.readdirSync(SEED_DIR).filter(file => file.endsWith('.json'));
    
    if (existingSeedFiles.length > 0) {
      console.info(`DEMO MODE: Found ${existingSeedFiles.length} existing seed files. Skipping initial snapshot.`);
    } else {
      console.info('DEMO MODE: No seed files found. Taking snapshot of current data directory...');
      const files = fs.readdirSync(DATA_DIR);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          fs.copyFileSync(path.join(DATA_DIR, file), path.join(SEED_DIR, file));
        }
      });
      console.info('Demo seed snapshot created successfully.');
    }

    console.info('Aligning reset timer to the clock...');

    const scheduleNextReset = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const ms = now.getMilliseconds();
      
      // Calculate minutes until the next 15-minute mark (0, 15, 30, 45)
      const minsToNext = 15 - (minutes % 15);
      const msToNext = (minsToNext * 60 * 1000) - (seconds * 1000) - ms;

      setTimeout(() => {
        console.info(`DEMO MODE: Clock hit :${new Date().getMinutes().toString().padStart(2, '0')}. Resetting data to seed snapshot...`);
        try {
          const seedFiles = fs.readdirSync(SEED_DIR);
          seedFiles.forEach(file => {
            if (file.endsWith('.json')) {
              fs.copyFileSync(path.join(SEED_DIR, file), path.join(DATA_DIR, file));
            }
          });
          console.info('Demo data reset complete.');
        } catch (e) {
          logError('Demo Reset Logic', e);
        }
        
        // Recursively schedule the next one
        scheduleNextReset();
      }, msToNext);
    };

    scheduleNextReset();

  } catch (err) {
    logError('Demo Snapshot Initialization', err);
  }
};

module.exports = { startDemoMode };