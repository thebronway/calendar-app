import React from 'react';
import { Timer, ChevronDown } from 'lucide-react';
import type { AppConfig } from '../../types';

interface SessionSettingsProps {
  config: AppConfig;
  onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void;
}

const SessionSettings: React.FC<SessionSettingsProps> = ({ config, onConfigChange }) => {
  return (
    <div className="bg-theme-panel p-6 rounded-xl shadow-sm border border-theme-item">
      <h4 className="text-lg font-bold mb-4 text-theme-text flex items-center">
        <Timer size={20} className="mr-2 text-indigo-500" /> Session Settings
      </h4>
      <div>
        <label className="block text-sm font-bold text-theme-text mb-2">
          Login Session Timeout
        </label>
        <div className="relative">
          <select
            value={config.sessionTimeout || 24}
            onChange={(e) => onConfigChange('sessionTimeout', Number(e.target.value))}
            className="w-full appearance-none pl-3 pr-10 py-2.5 border rounded-lg bg-theme-item border-theme-item text-theme-text outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            <option value={1}>1 Hour</option>
            <option value={12}>12 Hours</option>
            <option value={24}>24 Hours (1 Day)</option>
            <option value={168}>168 Hours (7 Days)</option>
            <option value={720}>720 Hours (30 Days)</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-theme-text-secondary">
            <ChevronDown size={16} />
          </div>
        </div>
        <p className="text-xs text-theme-text-secondary mt-2 font-medium">
          Determines how long users stay logged in before needing to authenticate again. Note: Changing this will only affect new logins.
        </p>
      </div>
    </div>
  );
};

export default SessionSettings;