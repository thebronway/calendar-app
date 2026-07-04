import React from 'react';
import { Palette, RotateCcw } from 'lucide-react';
import type { AppConfig } from '../../types';

interface ThemeSettingsProps {
  config: AppConfig;
  onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ config, onConfigChange }) => {
  const handleReset = () => {
    onConfigChange('themeBgLight', '#e5e7eb'); // gray-200
    onConfigChange('themeBgDark', '#111827'); // gray-900
    onConfigChange('themeAccent', '#3b82f6'); // blue-500
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold dark:text-white flex items-center">
          <Palette size={20} className="mr-2 text-pink-500" /> Custom Themeing
        </h4>
        <button 
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <RotateCcw size={14} /> Reset Defaults
        </button>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Personalize the look of your calendar. Changes will be visible immediately upon saving.
      </p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700 flex items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">Light Background</span>
              <span className="block text-xs text-gray-500 mt-0.5">The main app background.</span>
            </div>
            <input 
              type="color" 
              value={config.themeBgLight || '#e5e7eb'} 
              onChange={(e) => onConfigChange('themeBgLight', e.target.value)}
              className="w-10 h-10 p-0 border-0 rounded cursor-pointer shrink-0"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700 flex items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">Dark Background</span>
              <span className="block text-xs text-gray-500 mt-0.5">App background in dark mode.</span>
            </div>
            <input 
              type="color" 
              value={config.themeBgDark || '#111827'} 
              onChange={(e) => onConfigChange('themeBgDark', e.target.value)}
              className="w-10 h-10 p-0 border-0 rounded cursor-pointer shrink-0"
            />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700 flex items-center justify-between">
          <div>
            <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">Accent Color</span>
            <span className="block text-xs text-gray-500 mt-0.5">Used for buttons, highlights, and icons.</span>
          </div>
          <input 
            type="color" 
            value={config.themeAccent || '#3b82f6'} 
            onChange={(e) => onConfigChange('themeAccent', e.target.value)}
            className="w-10 h-10 p-0 border-0 rounded cursor-pointer shrink-0"
          />
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;