import React from 'react';
import { Globe } from 'lucide-react';
import type { AppConfig } from '../../types';

interface GlobalVisibilityPanelProps {
  config: AppConfig;
  onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void;
  onConfigSave: (config: AppConfig) => void;
  onTogglePublic: () => void;
  onTogglePrivate: () => void;
}

const GlobalVisibilityPanel: React.FC<GlobalVisibilityPanelProps> = ({
  config,
  onConfigChange,
  onConfigSave,
  onTogglePublic,
  onTogglePrivate,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
      <h4 className="text-lg font-bold mb-4 dark:text-white flex items-center">
        <Globe size={20} className="mr-2 text-blue-500" /> Global Visibility
      </h4>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
        <div>
          <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">Calendar View Mode</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md">
            {config.viewMode === 'private'
              ? 'Private: Unauthenticated visitors are blocked by a full-screen login prompt.'
              : 'Public: Anyone with the URL can view the calendar dashboard (read-only).'}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 bg-white dark:bg-gray-800 p-1.5 rounded-lg border dark:border-gray-600">
          <button
            onClick={onTogglePublic}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${config.viewMode !== 'private' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Public
          </button>
          <button
            onClick={onTogglePrivate}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${config.viewMode === 'private' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Private
          </button>
        </div>
      </div>

      {config.viewMode === 'private' && (
        <div className="mt-6 pt-6 border-t dark:border-gray-700">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Custom Login Message</label>
          <input 
            type="text"
            value={config.loginMessage || ''}
            onChange={(e) => onConfigChange('loginMessage', e.target.value)}
            onBlur={() => onConfigSave(config)}
            className="w-full p-2 border rounded-lg dark:bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white transition-colors"
            placeholder="e.g. Welcome to my calendar, please log in."
          />
          <p className="text-xs text-gray-500 mt-1.5 font-medium">If left blank, no message will be shown on the login screen.</p>
        </div>
      )}
    </div>
  );
};

export default GlobalVisibilityPanel;