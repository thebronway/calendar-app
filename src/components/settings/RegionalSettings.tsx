import React from 'react';
import { Globe, AlertCircle } from 'lucide-react';
import type { AppConfig } from '../../types';

interface RegionalSettingsProps {
  config: AppConfig;
  onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void;
  timezoneError: string | null;
}

const RegionalSettings: React.FC<RegionalSettingsProps> = ({ config, onConfigChange, timezoneError }) => {
  return (
    <div className="bg-theme-panel p-6 rounded-xl shadow-sm border border-theme-item">
      <h4 className="text-lg font-bold mb-4 text-theme-text flex items-center">
        <Globe size={20} className="mr-2" /> Regional Settings
      </h4>
      <div>
        <label className="block text-sm font-medium text-theme-text-secondary mb-1">Timezone</label>
        <input
          type="text"
          value={config.timezone}
          onChange={(e) => onConfigChange('timezone', e.target.value)}
          className={`w-full p-2 border rounded-lg bg-theme-item text-theme-text outline-none transition-colors ${timezoneError ? 'border-red-500 focus:ring-red-500' : 'border-theme-item focus:border-theme-accent'}`}
          placeholder="e.g. UTC, America/New_York"
        />
        {timezoneError ? (
          <p className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs mt-1.5 font-semibold">
            <AlertCircle size={13} /> {timezoneError}
          </p>
        ) : (
          <p className="text-xs text-theme-text-secondary mt-1">
            Must be a valid timezone.{' '}
            <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline">
              See List
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default RegionalSettings;