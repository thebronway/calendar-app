import { useMemo } from 'react';
import { slugify } from '../utils/helpers';
import type { CalendarDataset, KeyItem } from '../types';

interface UseFilteredDataParams {
  calendarData: CalendarDataset | null;
  keyItems: KeyItem[];
  categoryFilters: string[];
  activityFilters: string[];
}

export function useFilteredData({
  calendarData,
  keyItems,
  categoryFilters,
  activityFilters,
}: UseFilteredDataParams) {
  const filteredKeyItems = useMemo(() => {
    return keyItems.filter((item) => {
      const slug = slugify(item.label);
      if (item.isColorKey) {
        return categoryFilters.length === 0 || categoryFilters.includes(slug);
      } else {
        return activityFilters.length === 0 || activityFilters.includes(slug);
      }
    });
  }, [keyItems, categoryFilters, activityFilters]);

  const filteredCalendarData = useMemo(() => {
    if (!calendarData) return null;
    // If no filters active, return original data
    if (activityFilters.length === 0 && categoryFilters.length === 0) return calendarData;

    const filtered: CalendarDataset = {};
    Object.entries(calendarData).forEach(([key, day]) => {
      const newDay = { ...day, icons: [...(day.icons || [])] };
      
      let hasCatMatch = false;
      let hasActMatch = false;
      let keepDay = false;

      // Check category match
      if (categoryFilters.length > 0) {
        const cat = keyItems.find((k) => k.id === newDay.colorId);
        if (cat && categoryFilters.includes(slugify(cat.label))) {
          hasCatMatch = true;
        }
      }

      // Check activity match
      const matchingIcons = newDay.icons.filter((iconEntry) => {
        const iconValue = iconEntry.value || iconEntry.icon;
        const iconDef = keyItems.find(
          (k) => k.icon === iconValue && k.iconColor === iconEntry.color && !k.isColorKey
        );
        return iconDef && activityFilters.includes(slugify(iconDef.label));
      });

      if (activityFilters.length > 0 && matchingIcons.length > 0) {
        hasActMatch = true;
      }

      // Determine if we keep the day based on an OR logic
      if (categoryFilters.length > 0 && activityFilters.length > 0) {
        keepDay = hasCatMatch || hasActMatch;
      } else if (categoryFilters.length > 0) {
        keepDay = hasCatMatch;
      } else if (activityFilters.length > 0) {
        keepDay = hasActMatch;
      }

      if (keepDay) {
        // If it didn't match the category filter, strip the color so it doesn't look like a match
        if (categoryFilters.length > 0 && !hasCatMatch) {
          newDay.colorId = 'none';
        }
        // If it didn't match the category filter, strip non-matching activities
        if (activityFilters.length > 0 && !hasCatMatch) {
          newDay.icons = matchingIcons;
        }
      } else {
        // If the day doesn't match any of the hard filters, clear its visual data
        newDay.colorId = 'none';
        newDay.icons = [];
        newDay.locations = '';
        newDay.details = '';
      }

      filtered[key] = newDay;
    });
    return filtered;
  }, [calendarData, keyItems, activityFilters, categoryFilters]);

  return { filteredKeyItems, filteredCalendarData };
}