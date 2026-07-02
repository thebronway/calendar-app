import React from 'react';
import { Shield, Activity } from 'lucide-react';
import type { AppConfig } from '../../types';

interface PrivacyAnalyticsSettingsProps {
  config: AppConfig;
  onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void;
}

const PrivacyAnalyticsSettings: React.FC<PrivacyAnalyticsSettingsProps> = ({ config, onConfigChange }) => {
  // Strip anything that isn't a letter, number, or hyphen to prevent XSS
  const handleIdChange = (field: 'gaId' | 'umamiId', value: string) => {
    const sanitized = value.replace(/[^a-zA-Z0-9-]/g, '');
    onConfigChange(field, sanitized);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
      <h4 className="text-lg font-bold mb-4 dark:text-white flex items-center">
        <Shield size={20} className="mr-2 text-emerald-500" /> Privacy & Analytics
      </h4>
      
      <div className="space-y-6">
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

        <div className="pt-4 border-t dark:border-gray-700">
          <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Activity size={16} className="mr-1.5 text-blue-500" /> Tracking Integrations
          </h5>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Google Analytics ID</label>
              <input
                type="text"
                value={config.gaId || ''}
                onChange={(e) => handleIdChange('gaId', e.target.value)}
                className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                placeholder="e.g. G-12345ABCDE"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Umami Cloud Website ID</label>
              <input
                type="text"
                value={config.umamiId || ''}
                onChange={(e) => handleIdChange('umamiId', e.target.value)}
                className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mini internal component to avoid extra imports
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

export default PrivacyAnalyticsSettings;