import React from 'react';
import { Shield } from 'lucide-react';
import type { AppConfig } from '../../types';

interface StatsSettingsProps {
  config: AppConfig;
  onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void;
}

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

const StatsSettings: React.FC<StatsSettingsProps> = ({ config, onConfigChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
      <h4 className="text-lg font-bold mb-4 dark:text-white flex items-center">
        <Shield size={20} className="mr-2 text-emerald-500" /> Privacy & Stats
      </h4>
      
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Stats & Counters Visibility
        </label>
        <div className="relative">
          <select
            value={config.statsVisibility || 'all'}
            onChange={(e) => onConfigChange('statsVisibility', e.target.value as any)}
            className="w-full appearance-none pl-3 pr-10 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            <option value="all">Visible to Everyone</option>
            <option value="admin">Visible to Admins Only</option>
            <option value="none">Hidden Completely</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400">
            <ChevronDownIcon />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 font-medium">
          Controls who can see your total days traveling, location leaderboards, and category/activity counts.
        </p>
      </div>
    </div>
  );
};

export default StatsSettings;