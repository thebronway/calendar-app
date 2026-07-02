import React from 'react';
import { Maximize2 } from 'lucide-react';
import ToggleSwitch from '../ToggleSwitch';
import type { AppConfig } from '../../types';

interface LayoutPreferencesProps {
  config: AppConfig;
  onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void;
}

const LayoutPreferences: React.FC<LayoutPreferencesProps> = ({ config, onConfigChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
      <h4 className="text-lg font-bold mb-4 dark:text-white flex items-center">
        <Maximize2 size={20} className="mr-2" /> Layout Preferences
      </h4>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
          <div>
            <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">Auto-Scroll to Current Month</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">Automatically scroll down to the current month on load.</span>
          </div>
          <div className="flex items-center gap-4 shrink-0 mt-2 sm:mt-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Mobile</span>
              <ToggleSwitch
                checked={!!config.autoScrollMobile}
                onChange={() => onConfigChange('autoScrollMobile', !config.autoScrollMobile)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Desktop</span>
              <ToggleSwitch
                checked={!!config.autoScrollDesktop}
                onChange={() => onConfigChange('autoScrollDesktop', !config.autoScrollDesktop)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
          <div>
            <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">Collapse Key Section</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">Hide the categories and activities key by default.</span>
          </div>
          <div className="flex items-center gap-4 shrink-0 mt-2 sm:mt-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Mobile</span>
              <ToggleSwitch
                checked={!!config.collapseKeyMobile}
                onChange={() => onConfigChange('collapseKeyMobile', !config.collapseKeyMobile)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Desktop</span>
              <ToggleSwitch
                checked={!!config.collapseKeyDesktop}
                onChange={() => onConfigChange('collapseKeyDesktop', !config.collapseKeyDesktop)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
          <div>
            <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">Collapse Stats Section</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">Hide the traveling stats and location counts by default.</span>
          </div>
          <div className="flex items-center gap-4 shrink-0 mt-2 sm:mt-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Mobile</span>
              <ToggleSwitch
                checked={!!config.collapseStatsMobile}
                onChange={() => onConfigChange('collapseStatsMobile', !config.collapseStatsMobile)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Desktop</span>
              <ToggleSwitch
                checked={!!config.collapseStatsDesktop}
                onChange={() => onConfigChange('collapseStatsDesktop', !config.collapseStatsDesktop)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutPreferences;