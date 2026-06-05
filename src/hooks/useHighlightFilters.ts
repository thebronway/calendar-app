import { useState, useCallback } from 'react';
import type { HighlightFilters, IconFilter, DayData, KeyItem } from '../types';

interface UseHighlightFiltersReturn {
  highlightFilters: HighlightFilters;
  handleLocationFilterToggle: (loc: string) => void;
  handleIconFilterToggle: (item: Pick<KeyItem, 'icon' | 'iconColor'>) => void;
  handleCategoryFilterToggle: (categoryId: string) => void;
  clearFilters: () => void;
  shouldHighlightCell: (dayInfo: DayData) => boolean;
}

/**
 * Manages highlight filter state (locations + icons + categories) and the cell highlight check.
 */
export function useHighlightFilters(): UseHighlightFiltersReturn {
  const [highlightFilters, setHighlightFilters] = useState<HighlightFilters>({
    locations: [],
    icons: [],
    categories: [],
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

  const handleCategoryFilterToggle = (categoryId: string) => {
    setHighlightFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const clearFilters = () => setHighlightFilters({ locations: [], icons: [], categories: [] });

  const shouldHighlightCell = useCallback(
    (dayInfo: DayData): boolean => {
      const hasLocFilters = highlightFilters.locations.length > 0;
      const hasIconFilters = highlightFilters.icons.length > 0;
      const hasCatFilters = highlightFilters.categories?.length > 0;

      if (!hasLocFilters && !hasIconFilters && !hasCatFilters) return false;

      if (hasLocFilters) {
        const dayLocs = (dayInfo.locations || '').split(',').map((l) => l.trim()).filter(Boolean);
        if (highlightFilters.locations.some(f => dayLocs.includes(f))) return true;
      }

      if (hasIconFilters) {
        const dayIcons = dayInfo.icons || [];
        if (highlightFilters.icons.some(f => 
          dayIcons.some(d => (d.value || d.icon) === f.icon && d.color === f.iconColor)
        )) return true;
      }

      if (hasCatFilters) {
        if (highlightFilters.categories.includes(dayInfo.colorId)) return true;
      }

      return false; // If there were active filters but none matched
    },
    [highlightFilters]
  );

  return {
    highlightFilters,
    handleLocationFilterToggle,
    handleIconFilterToggle,
    handleCategoryFilterToggle,
    clearFilters,
    shouldHighlightCell,
  };
}