import DOMPurify from 'dompurify';
import { MONTHS } from './constants';
import type { CalendarDataset, DayData } from '../types';

/**
 * Converts a string into a URL-safe slug.
 */
export const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
};

/**
 * Sanitize HTML string to prevent XSS.
 * Safe to use with dangerouslySetInnerHTML.
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 's', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'span'],
    ALLOWED_ATTR: ['class'],
  });
};

/**
 * Validate a timezone string using the Intl API.
 */
export const isValidTimezone = (tz: string): boolean => {
  if (!tz) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export const createDateKey = (year: number, monthIndex: number, day: number): string => {
  const date = new Date(Date.UTC(year, monthIndex, day));
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = date.getUTCDate().toString().padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}-${d}`;
};

export const generateCalendarForYear = (year: number): CalendarDataset => {
  const days: CalendarDataset = {};
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const monthName = MONTHS[monthIndex];
    for (let day = 1; day <= daysInMonth; day++) {
      const key = createDateKey(year, monthIndex, day);
      const entry: DayData = {
        day,
        month: monthName,
        locations: '',
        details: '',
        colorId: 'none',
        icons: [],
        year,
      };
      days[key] = entry;
    }
  }
  return days;
};

export const getAdjacentDateKey = (currentKey: string, direction: 'prev' | 'next'): string => {
  if (!currentKey || currentKey === 'bulk') return currentKey;
  const [y, m, d] = currentKey.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + (direction === 'next' ? 1 : -1));
  const nextMonth = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const nextDay = date.getUTCDate().toString().padStart(2, '0');
  return `${date.getUTCFullYear()}-${nextMonth}-${nextDay}`;
};