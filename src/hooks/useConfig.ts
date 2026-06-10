import { useState, useCallback } from 'react';
import type { AppConfig } from '../types';

const DEFAULT_CONFIG: AppConfig = {
  timezone: 'UTC',
  headerStyle: 'simple',
  browserTitleStyle: 'simple',
  ownerName: '',
  headerIcon: 'CalendarDays',
  autoScrollMobile: true,
  autoScrollDesktop: false,
  collapseKeyMobile: true,
  collapseKeyDesktop: false,
  collapseStatsMobile: true,
  collapseStatsDesktop: false,
};

interface UseConfigParams {
  role: string;
  onYearChange?: (year: number) => void;
}

interface UseConfigReturn {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  fetchConfig: () => Promise<void>;
  saveConfig: (newConfig: AppConfig) => Promise<void>;
}

export function useConfig({ role, onYearChange }: UseConfigParams): UseConfigReturn {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/config');
      const appConfig: AppConfig = await response.json();
      setConfig((prev) => ({ ...DEFAULT_CONFIG, ...appConfig }));
      try {
        const now = new Date(
          new Date().toLocaleString('en-US', { timeZone: appConfig.timezone })
        );
        onYearChange?.(now.getFullYear());
      } catch {
        console.warn('Invalid timezone in config');
      }
    } catch (e) {
      console.error('Config fetch error', e);
    }
  }, [onYearChange]);

  const saveConfig = useCallback(
    async (newConfig: AppConfig) => {
      if (role !== 'admin') return;
      try {
        const res = await fetch('/api/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newConfig),
        });
        if (res.status === 401 || res.status === 403) {
          window.location.reload();
          return;
        }
        if (res.ok) setConfig(newConfig);
      } catch (e) {
        console.error('Config save error', e);
      }
    },
    [role]
  );

  return { config, setConfig, fetchConfig, saveConfig };
}
