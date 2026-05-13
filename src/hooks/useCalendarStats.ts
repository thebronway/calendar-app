import { useMemo } from 'react';
import type { CalendarDataset, CalendarStats, KeyItem } from '../types';

interface UseCalendarStatsParams {
  calendarData: CalendarDataset | null;
  year: number;
  keyItems: KeyItem[];
}

interface UseCalendarStatsReturn {
  stats: CalendarStats;
  iconCounts: Record<string, number>;
  locationCounts: [string, number][];
}

/**
 * Derives stats, iconCounts, and locationCounts from calendarData.
 */
export function useCalendarStats({
  calendarData,
  year,
  keyItems,
}: UseCalendarStatsParams): UseCalendarStatsReturn {
  const stats = useMemo((): CalendarStats => {
    if (!calendarData) return { totalDays: 0, categories: {}, totalHighlighted: 0 };
    const totalDays = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
    const catStats: Record<string, number> = {};
    let totalHighlighted = 0;
    keyItems.filter((k) => k.isColorKey).forEach((k) => (catStats[k.id] = 0));
    Object.values(calendarData).forEach((day) => {
      if (day.colorId && day.colorId !== 'none' && catStats[day.colorId] !== undefined) {
        catStats[day.colorId]++;
        totalHighlighted++;
      }
    });
    return { totalDays, categories: catStats, totalHighlighted };
  }, [calendarData, year, keyItems]);

  const iconCounts = useMemo((): Record<string, number> => {
    if (!calendarData) return {};
    const counts: Record<string, number> = {};
    Object.values(calendarData).forEach((day) => {
      (day.icons || []).forEach((i) => {
        const key = `${i.value || i.icon}-${i.color}`;
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    return counts;
  }, [calendarData]);

  const locationCounts = useMemo((): [string, number][] => {
    if (!calendarData) return [];
    const counts: Record<string, number> = {};
    Object.values(calendarData).forEach((d) =>
      (d.locations || '')
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((l) => (counts[l] = (counts[l] || 0) + 1))
    );
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [calendarData]);

  return { stats, iconCounts, locationCounts };
}
