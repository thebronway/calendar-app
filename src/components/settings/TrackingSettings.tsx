import React from 'react';
import { Activity } from 'lucide-react';
import type { AppConfig } from '../../types';

interface TrackingSettingsProps {
  config: AppConfig;
  onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void;
}

const TrackingSettings: React.FC<TrackingSettingsProps> = ({ config, onConfigChange }) => {
  // Strip anything that isn't a letter, number, or hyphen to prevent Stored XSS on IDs
  const handleIdChange = (field: 'gaId' | 'umamiId', value: string) => {
    const sanitized = value.replace(/[^a-zA-Z0-9-]/g, '');
    onConfigChange(field, sanitized);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
      <h4 className="text-lg font-bold mb-4 dark:text-white flex items-center">
        <Activity size={20} className="mr-2 text-blue-500" /> Tracking Integrations
      </h4>
      
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
        
        <div className="pt-2 border-t dark:border-gray-700 mt-2">
          <label className="block text-xs font-bold text-gray-500 mb-1 mt-2">Umami Website ID</label>
          <input
            type="text"
            value={config.umamiId || ''}
            onChange={(e) => handleIdChange('umamiId', e.target.value)}
            className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Self-Hosted Umami Script URL (Optional)</label>
          <input
            type="url"
            value={config.umamiUrl || ''}
            onChange={(e) => onConfigChange('umamiUrl', e.target.value)}
            className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
            placeholder="e.g. http://192.168.1.50:3000/script.js"
          />
          <p className="text-[10px] text-gray-500 mt-1 font-medium">
            Leave blank to default to Umami Cloud (https://cloud.umami.is/script.js).
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackingSettings;