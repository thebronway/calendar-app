import React, { useState, useEffect } from 'react';
import { Settings, X, Save, Monitor, Shield, Palette } from 'lucide-react';
import { isValidTimezone } from '../utils/helpers';
import { useConfirm } from '../contexts/ConfirmContext';
import { usePreventTabClose } from '../hooks/useUnsavedChanges';
import AppearanceSettings from './settings/AppearanceSettings';
import LayoutPreferences from './settings/LayoutPreferences';
import RegionalSettings from './settings/RegionalSettings';
import SessionSettings from './settings/SessionSettings';
import StatsSettings from './settings/StatsSettings';
import TrackingSettings from './settings/TrackingSettings';
import ThemeSettings from './settings/ThemeSettings';
import type { AppConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onConfigSave: (config: AppConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onConfigSave }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [timezoneError, setTimezoneError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'display' | 'system' | 'theme'>('display');

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
      setTimezoneError(null);
    }
  }, [isOpen, config]);

  const isDirty = JSON.stringify(localConfig) !== JSON.stringify(config);
  const { confirm } = useConfirm();
  usePreventTabClose(isDirty);

  const handleClose = async () => {
    if (isDirty && !(await confirm())) return;
    onClose();
  };

  const handleConfigChange = <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
    if (field === 'timezone') setTimezoneError(null);
  };

  const handleSave = () => {
    if (!isValidTimezone(localConfig.timezone)) {
      setTimezoneError(`"${localConfig.timezone}" is not a valid timezone.`);
      return;
    }
    onConfigSave(localConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-xl shrink-0">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <Settings size={24} className="mr-3 text-blue-500" /> Settings
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="flex overflow-x-auto border-b dark:border-gray-700 bg-white dark:bg-gray-800 px-6 shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setActiveTab('display')}
            className={`flex items-center py-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'display' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            <Monitor size={18} className="mr-2" />
            Display
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center py-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'system' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            <Shield size={18} className="mr-2" />
            System & Privacy
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center py-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'theme' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            <Palette size={18} className="mr-2" />
            Theme
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-100 dark:bg-gray-900/50">
          {activeTab === 'display' && (
            <>
              <AppearanceSettings 
                config={localConfig} 
                onConfigChange={handleConfigChange} 
              />
              <LayoutPreferences 
                config={localConfig} 
                onConfigChange={handleConfigChange} 
              />
              <RegionalSettings 
                config={localConfig} 
                onConfigChange={handleConfigChange} 
                timezoneError={timezoneError} 
              />
            </>
          )}
          {activeTab === 'system' && (
            <>
              <SessionSettings 
                config={localConfig} 
                onConfigChange={handleConfigChange} 
              />
              <StatsSettings 
                config={localConfig} 
                onConfigChange={handleConfigChange} 
              />
              <TrackingSettings 
                config={localConfig} 
                onConfigChange={handleConfigChange} 
              />
            </>
          )}
          {activeTab === 'theme' && (
            <ThemeSettings 
              config={localConfig} 
              onConfigChange={handleConfigChange} 
            />
          )}
        </div>
        
        <div className="p-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end space-x-3 rounded-b-xl shrink-0">
          <button onClick={handleClose} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 shadow-lg flex items-center">
            <Save size={18} className="mr-2" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;