const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// --- Text Formatting Helpers ---
const slugify = (text) => text ? text.toString().toLowerCase().trim().replace(/[\s\W-]+/g, '-') : '';

const escapeICalText = (text) => {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
};

// --- Date Helpers ---
const formatDate = (dateString) => dateString.replace(/-/g, '');

const getNextDay = (dateString) => {
  const [y, m, d] = dateString.split('-');
  const date = new Date(Date.UTC(parseInt(y), parseInt(m) - 1, parseInt(d)));
  date.setUTCDate(date.getUTCDate() + 1);
  const nextY = date.getUTCFullYear();
  const nextM = String(date.getUTCMonth() + 1).padStart(2, '0');
  const nextD = String(date.getUTCDate()).padStart(2, '0');
  return `${nextY}${nextM}${nextD}`;
};

/**
 * Core Engine: Generates an iCal string based on Feed Profile rules
 */
async function generateICalFeed(profile, dataDir) {
  const currentYear = new Date().getFullYear();
  // 1. The Stitcher: Combine data from Previous, Current, and Next Year
  const yearsToFetch = [currentYear - 1, currentYear, currentYear + 1];
  
  let allDays = [];
  let keyItems = [];

  for (const year of yearsToFetch) {
    const filePath = path.join(dataDir, `${year}_data.json`);
    try {
      const fileData = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(fileData);
      if (parsed.dayData) {
        Object.entries(parsed.dayData).forEach(([key, day]) => {
          allDays.push({ key, ...day });
        });
        // Grab the most up-to-date Key rules from the current year to translate IDs to labels
        if (year === currentYear && parsed.keyItems) {
          keyItems = parsed.keyItems;
        }
      }
    } catch (err) {
      // It's totally fine if a year file doesn't exist yet
    }
  }

  // New Step 1 & Step 2 Query Builder Engine
  const events = [];

  const getCategoryLabel = (colorId) => {
    const cat = keyItems.find(k => k.id === colorId);
    return cat ? cat.label : '';
  };

  const getIconLabel = (icon) => {
    if (icon.displayName) return icon.displayName; 
    const keyDef = keyItems.find(k => k.icon === (icon.value || icon.icon) && k.iconColor === icon.color);
    return keyDef ? keyDef.label : (icon.value || icon.icon);
  };

  const buildEventStr = (day, title, locationFieldVal, descriptionFieldVal) => {
    const dtStart = formatDate(day.key);
    const dtEnd = getNextDay(day.key);
    const uid = crypto.randomUUID(); 
    const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `SUMMARY:${escapeICalText(title)}`,
      `LOCATION:${escapeICalText(locationFieldVal)}`,
      `DESCRIPTION:${escapeICalText(descriptionFieldVal)}`,
      'END:VEVENT'
    ].join('\r\n');
  };

  allDays.forEach(day => {
    const dayLocationStr = day.locations || '';
    const dayNotes = stripHtml(day.details || '');
    const dayCategory = getCategoryLabel(day.colorId);
    const dayIcons = day.icons || [];
    const dayActivitiesList = dayIcons.map(i => getIconLabel(i)).join(', ');
    const dayLocsArray = dayLocationStr.split(',').map(l => l.trim()).filter(Boolean);

    // Skip entirely empty days
    if (day.colorId === 'none' && dayIcons.length === 0 && !dayLocationStr) return;

    // --- STEP 1: EVALUATE TRIGGER MATCHES & TITLES ---
    let matchedTitles = [];

    if (profile.triggerType === 'location') {
      if (profile.locationMode === 'specific') {
        const targetLocs = profile.selectedLocations || [];
        // Find intersection
        const matches = dayLocsArray.filter(l => targetLocs.includes(l));
        if (matches.length > 0) {
          matchedTitles = profile.groupingMode === 'separate' ? matches : [matches.join(', ')];
        }
      } else {
        // Any Location
        if (dayLocsArray.length > 0) {
          matchedTitles = profile.groupingMode === 'separate' ? dayLocsArray : [dayLocationStr];
        }
      }
    } else {
      // Data-Driven Trigger (Categories / Activities)
      const selCats = profile.selectedCategories || [];
      const targetActs = profile.selectedActivities || [];

      let catMatch = selCats.includes(day.colorId);
      
      // Match incoming day icons against registered config definitions using true IDs
      let actMatch = dayIcons.some(i => {
        const keyDef = keyItems.find(k => k.icon === (i.value || i.icon) && k.iconColor === i.color);
        return keyDef && targetActs.includes(keyDef.id);
      });

      let triggerIsMet = false;
      const mode = profile.dataTriggerMode || 'categories';
      const op = profile.dataLogicalOperator || 'OR';

      if (mode === 'categories') triggerIsMet = catMatch;
      else if (mode === 'activities') triggerIsMet = actMatch;
      else if (mode === 'both') {
        triggerIsMet = op === 'AND' ? (catMatch && actMatch) : (catMatch || actMatch);
      }

      if (triggerIsMet) {
        // Determine what becomes the text title(s)
        let potentialTitles = [];
        if (mode === 'categories' || (mode === 'both' && op === 'OR' && catMatch)) {
          if (dayCategory) potentialTitles.push(dayCategory);
        }
        if (mode === 'activities' || (mode === 'both' && actMatch)) {
          dayIcons.forEach(i => {
            const keyDef = keyItems.find(k => k.icon === (i.value || i.icon) && k.iconColor === i.color);
            if (targetActs.length === 0 || (keyDef && targetActs.includes(keyDef.id))) {
              potentialTitles.push(getIconLabel(i));
            }
          });
        }

        if (potentialTitles.length === 0) potentialTitles.push(dayCategory || 'Calendar Event');

        if (profile.groupingMode === 'separate') {
          matchedTitles = potentialTitles;
        } else {
          matchedTitles = [potentialTitles.join(' & ')];
        }
      }
    }

    // If this day didn't trigger any events, stop here
    if (matchedTitles.length === 0) return;

    // --- STEP 2: BUILD PAYLOAD (METADATA) ---
    const eventLocation = profile.includeLocationField ? dayLocationStr : '';

    // Description Block Builder
    const descParts = [];
    const payload = profile.descriptionPayload || {};
    
    if (payload.notes && dayNotes) descParts.push(dayNotes);
    if (payload.categories && dayCategory) descParts.push(`Category: ${dayCategory}`);
    if (payload.locations && dayLocationStr) descParts.push(`Locations: ${dayLocationStr}`);
    if (payload.activities && dayActivitiesList) descParts.push(`Activities: ${dayActivitiesList}`);

    const eventDescription = descParts.join('\\n\\n');

    // Push an event for each resolved title
    matchedTitles.forEach(title => {
      events.push(buildEventStr(day, title, eventLocation, eventDescription));
    });
  });

  // Wrap it all in standard iCalendar headers
  const calendarStr = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//TheBronway//CalendarApp//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICalText(profile.name)}`,
    'X-WR-TIMEZONE:UTC',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');

  return calendarStr;
}

module.exports = { generateICalFeed };