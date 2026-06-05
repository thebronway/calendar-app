import { useState, useEffect, useCallback } from 'react';
import { slugify } from '../utils/helpers';

export type ViewType = 'year' | 'list' | 'guide' | string; // string allows for specific month names like 'january'

export interface RouteState {
  year: number;
  view: ViewType;
  activityFilters: string[];
  categoryFilters: string[];
}

export function useCustomRoute() {
  const parseUrl = useCallback((): RouteState => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const searchParams = new URLSearchParams(window.location.search);

    let year = new Date().getFullYear();
    let view: ViewType = 'year';

    // Parse Year (e.g., /2026/...)
    if (pathParts.length > 0) {
      const parsedYear = parseInt(pathParts[0], 10);
      if (!isNaN(parsedYear) && parsedYear >= 1900 && parsedYear <= 2100) {
        year = parsedYear;
      } else if (isNaN(parsedYear)) {
        // Handle routes without a year (e.g., /guide)
        view = pathParts[0].toLowerCase();
      }
    }

    // Parse View (e.g., /2026/list)
    if (pathParts.length > 1) {
      view = pathParts[1].toLowerCase();
    }

    // Parse Query Parameters (?a=run,swim&c=vacation)
    const aParam = searchParams.get('a');
    const cParam = searchParams.get('c');

    const activityFilters = aParam ? aParam.split(',').map(s => slugify(s)).filter(Boolean) : [];
    const categoryFilters = cParam ? cParam.split(',').map(s => slugify(s)).filter(Boolean) : [];

    return { year, view, activityFilters, categoryFilters };
  }, []);

  const [route, setRoute] = useState<RouteState>(() => parseUrl());

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handleLocationChange = () => setRoute(parseUrl());
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [parseUrl]);

  // Navigate to a new URL without reloading the page
  const navigate = useCallback((newPath: string) => {
    window.history.pushState({}, '', newPath);
    setRoute(parseUrl());
  }, [parseUrl]);

  return { route, navigate };
}