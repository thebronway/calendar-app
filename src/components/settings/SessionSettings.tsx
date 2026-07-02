import React from 'react';
import { Timer, ChevronDown } from 'lucide-react';
import type { AppConfig } from '../../types';

interface SessionSettingsProps {
  config: AppConfig;
  onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void;
}

const SessionSettings: React.FC<SessionSettingsProps> = ({ config, onConfigChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
      <h4 className="text-lg font-bold mb-4 dark:text-white flex items-center">
        <Timer size={20} className="mr-2 text-indigo-500" /> Session Settings
      </h4>
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Login Session Timeout
        </label>
        <div className="relative">
          <select
            value={config.sessionTimeout || 24}
            onChange={(e) => onConfigChange('sessionTimeout', Number(e.target.value))}
            className="w-full appearance-none pl-3 pr-10 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            <option value={1}>1 Hour</option>
            <option value={12}>12 Hours</option>
            <option value={24}>24 Hours (1 Day)</option>
            <option value={168}>168 Hours (7 Days)</option>
            <option value={720}>720 Hours (30 Days)</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400">
            <ChevronDown size={16} />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 font-medium">
          Determines how long users stay logged in before needing to authenticate again. Note: Changing this will only affect new logins.
        </p>
      </div>
    </div>
  );
};

export default SessionSettings;