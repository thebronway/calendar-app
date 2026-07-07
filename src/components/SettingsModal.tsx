import React, { useState, useEffect } from 'react';
import { Settings, X, Save, Monitor, Shield, Palette, Database } from 'lucide-react';
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
import DataManagementSettings from './settings/DataManagementSettings';
import type { AppConfig } from '../types';
import type { ThemeMode } from '../hooks/useTheme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onConfigSave: (config: AppConfig) => void;
  currentTheme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onConfigSave, currentTheme, setTheme }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [timezoneError, setTimezoneError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'display' | 'system' | 'theme' | 'data'>('display');

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
      <div className="bg-theme-panel text-theme-text rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-theme-item">
        <div className="flex justify-between items-center p-6 border-b border-theme-item bg-theme-item rounded-t-xl shrink-0">
          <h3 className="text-2xl font-bold flex items-center">
            <Settings size={24} className="mr-3 text-theme-accent" /> Settings
          </h3>
          <button onClick={handleClose} className="text-theme-text-secondary hover:text-theme-text transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex overflow-x-auto border-b border-theme-item bg-theme-panel px-6 shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setActiveTab('display')}
            className={`flex items-center py-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'display' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text'}`}
          >
            <Monitor size={18} className="mr-2" />
            Display
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center py-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'system' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text'}`}
          >
            <Shield size={18} className="mr-2" />
            System & Privacy
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center py-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'theme' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text'}`}
          >
            <Palette size={18} className="mr-2" />
            Theme
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center py-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'data' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-text-secondary hover:text-theme-text'}`}
          >
            <Database size={18} className="mr-2" />
            Backup
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-theme-base">
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
              currentTheme={currentTheme}
              setTheme={setTheme}
            />
          )}
          {activeTab === 'data' && (
            <DataManagementSettings config={localConfig} />
          )}
        </div>
        
        <div className="p-6 border-t border-theme-item bg-theme-item flex justify-end space-x-3 rounded-b-xl shrink-0">
          <button onClick={handleClose} className="px-6 py-2 rounded-lg border border-theme-grid-divider font-bold text-theme-text bg-theme-panel hover:bg-theme-item-hover transition-colors shadow-sm">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-theme-accent text-theme-accent-text font-bold hover:opacity-90 transition-colors shadow-sm flex items-center">
            <Save size={18} className="mr-2" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;