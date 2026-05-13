import { useState, useCallback } from 'react';
import type { HighlightFilters, IconFilter, DayData, KeyItem } from '../types';

interface UseHighlightFiltersReturn {
  highlightFilters: HighlightFilters;
  handleLocationFilterToggle: (loc: string) => void;
  handleIconFilterToggle: (item: Pick<KeyItem, 'icon' | 'iconColor'>) => void;
  clearFilters: () => void;
  shouldHighlightCell: (dayInfo: DayData) => boolean;
}

/**
 * Manages highlight filter state (locations + icons) and the cell highlight check.
 */
export function useHighlightFilters(): UseHighlightFiltersReturn {
  const [highlightFilters, setHighlightFilters] = useState<HighlightFilters>({
    locations: [],
    icons: [],
  });

  const handleLocationFilterToggle = (loc: string) => {
    setHighlightFilters((prev) => ({
      ...prev,
      locations: prev.locations.includes(loc)
        ? prev.locations.filter((l) => l !== loc)
        : [...prev.locations, loc],
    }));
  };

  const handleIconFilterToggle = (item: Pick<KeyItem, 'icon' | 'iconColor'>) => {
    const exists = highlightFilters.icons.find(
      (f) => f.icon === item.icon && f.iconColor === item.iconColor
    );
    setHighlightFilters((prev) => ({
      ...prev,
      icons: exists
        ? prev.icons.filter((i) => i !== exists)
        : [...prev.icons, { icon: item.icon ?? '', iconColor: item.iconColor ?? '' }],
    }));
  };

  const clearFilters = () => setHighlightFilters({ locations: [], icons: [] });

  const shouldHighlightCell = useCallback(
    (dayInfo: DayData): boolean => {
      if (!highlightFilters.locations.length && !highlightFilters.icons.length) return false;

      const dayLocs = (dayInfo.locations || '')
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);
      const locMatch =
        !highlightFilters.locations.length ||
        highlightFilters.locations.every((f) => dayLocs.includes(f));

      const dayIcons = dayInfo.icons || [];
      const iconMatch =
        !highlightFilters.icons.length ||
        highlightFilters.icons.every((f: IconFilter) =>
          dayIcons.some(
            (d) => (d.value || d.icon) === f.icon && d.color === f.iconColor
          )
        );

      return locMatch && iconMatch;
    },
    [highlightFilters]
  );

  return {
    highlightFilters,
    handleLocationFilterToggle,
    handleIconFilterToggle,
    clearFilters,
    shouldHighlightCell,
  };
}
