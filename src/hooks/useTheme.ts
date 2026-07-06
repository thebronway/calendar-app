import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'custom';

interface UseThemeReturn {
  themeMode: ThemeMode;
  cycleTheme: () => void;
}

/**
 * Manages 3-way theme state (Light, Dark, Custom), initialization from localStorage,
 * and DOM class updates.
 */
export function useTheme(): UseThemeReturn {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let initialTheme: ThemeMode = 'light';
    
    if (savedTheme === 'dark' || savedTheme === 'custom') {
      initialTheme = savedTheme;
    } else if (!savedTheme && prefersDark) {
      initialTheme = 'dark';
    }
    
    setThemeMode(initialTheme);
    updateDOM(initialTheme);
  }, []);

  const updateDOM = (mode: ThemeMode) => {
    document.documentElement.classList.remove('dark', 'custom-theme');
    if (mode === 'dark') document.documentElement.classList.add('dark');
    // Apply both classes so Tailwind defaults to dark mode utilities before our custom overrides kick in
    if (mode === 'custom') document.documentElement.classList.add('dark', 'custom-theme');
  };

  const cycleTheme = () => {
    setThemeMode((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : prev === 'dark' ? 'custom' : 'light';
      updateDOM(next);
      localStorage.setItem('theme', next);
      return next;
    });
  };

  return { themeMode, cycleTheme };
}