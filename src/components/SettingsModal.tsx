import React, { useState, useEffect } from 'react';
import { Settings, X, Layout, Globe, Save, AlertCircle, Maximize2 } from 'lucide-react';
import ToggleSwitch from './ToggleSwitch';
import { ICON_KEYS, ICON_MAP } from '../utils/constants';
import { isValidTimezone } from '../utils/helpers';
import { useConfirm } from '../contexts/ConfirmContext';
import { usePreventTabClose } from '../hooks/useUnsavedChanges';
import type { AppConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onConfigSave: (config: AppConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onConfigSave }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [timezoneError, setTimezoneError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
      setTimezoneError(null);
      setShowIconPicker(false);
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

  const headerIcons = ICON_KEYS.filter(
    (k) =>
      k.startsWith('Calendar') ||
      ['Star', 'Heart', 'Home', 'Activity'].includes(k) ||
      localConfig.headerIcon === k
  );

  const generateText = (style: string) => {
    const y = new Date().getFullYear();
    const n = localConfig.ownerName || 'Name';
    if (style === 'possessive') return `${n}'s Calendar`;
    if (style === 'question') return `Where is ${n} in ${y}?`;
    return `${y} Calendar`;
  };

  const activeHeaderStyle = localConfig.headerStyle || 'simple';
  const activeBrowserStyle = localConfig.browserTitleStyle || 'simple';
  const HeaderIcon = ICON_MAP[localConfig.headerIcon || 'CalendarDays'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-xl shrink-0">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <Settings size={24} className="mr-3 text-blue-500" /> Settings
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
            <h4 className="text-lg font-bold mb-4 dark:text-white flex items-center">
              <Layout size={20} className="mr-2" /> Page Appearance
            </h4>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Main Page Icon</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 flex items-center justify-center bg-blue-50 dark:bg-gray-700 rounded-xl border-2 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400">
                  {HeaderIcon && <HeaderIcon size={32} />}
                </div>
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Change Icon
                </button>
              </div>
              {showIconPicker && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700 grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-40 overflow-y-auto">
                  {headerIcons.map((key) => {
                    const Icon = ICON_MAP[key];
                    if (!Icon) return null;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          handleConfigChange('headerIcon', key);
                          setShowIconPicker(false);
                        }}
                        className={`p-2 rounded hover:bg-white dark:hover:bg-gray-700 flex justify-center ${localConfig.headerIcon === key ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500' : 'text-gray-600 dark:text-gray-400'}`}
                      >
                        <Icon size={20} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Page Header Title</label>
              <div className="grid grid-cols-1 gap-2 mb-4">
                {[
                  { id: 'simple', label: '<Year> Calendar' },
                  { id: 'possessive', label: "<Name>'s Calendar" },
                  { id: 'question', label: 'Where is <Name> in <Year>?' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleConfigChange('headerStyle', opt.id as AppConfig['headerStyle'])}
                    className={`p-3 text-left rounded-lg border text-sm font-medium transition-all ${activeHeaderStyle === opt.id ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-900 border dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Live Preview</span>
                <h1 className="text-2xl font-extrabold flex items-center text-gray-900 dark:text-white">
                  {HeaderIcon && <HeaderIcon size={28} className="mr-3 text-blue-600" />}
                  <span>{generateText(activeHeaderStyle)}</span>
                </h1>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Browser Tab Title</label>
              <div className="grid grid-cols-1 gap-2 mb-4">
                {[
                  { id: 'simple', label: '<Year> Calendar' },
                  { id: 'possessive', label: "<Name>'s Calendar" },
                  { id: 'question', label: 'Where is <Name> in <Year>?' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleConfigChange('browserTitleStyle', opt.id as AppConfig['browserTitleStyle'])}
                    className={`p-3 text-left rounded-lg border text-sm font-medium transition-all ${activeBrowserStyle === opt.id ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="p-4 bg-gray-200 dark:bg-black rounded-lg border dark:border-gray-700">
                <span className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider text-center">Browser Tab Preview</span>
                <div className="bg-gray-300 dark:bg-gray-800 p-2 rounded-t-lg flex items-center gap-2">
                  <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-t-md text-xs font-medium flex items-center shadow-sm w-48">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="truncate">{generateText(activeBrowserStyle)}</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 h-8 border-x border-b dark:border-gray-800"></div>
              </div>
            </div>

            {(activeHeaderStyle !== 'simple' || activeBrowserStyle !== 'simple') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={localConfig.ownerName || ''}
                  onChange={(e) => handleConfigChange('ownerName', e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g. John"
                />
              </div>
            )}
          </div>

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
                      checked={!!localConfig.autoScrollMobile}
                      onChange={() => handleConfigChange('autoScrollMobile', !localConfig.autoScrollMobile)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Desktop</span>
                    <ToggleSwitch
                      checked={!!localConfig.autoScrollDesktop}
                      onChange={() => handleConfigChange('autoScrollDesktop', !localConfig.autoScrollDesktop)}
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
                      checked={!!localConfig.collapseKeyMobile}
                      onChange={() => handleConfigChange('collapseKeyMobile', !localConfig.collapseKeyMobile)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Desktop</span>
                    <ToggleSwitch
                      checked={!!localConfig.collapseKeyDesktop}
                      onChange={() => handleConfigChange('collapseKeyDesktop', !localConfig.collapseKeyDesktop)}
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
                      checked={!!localConfig.collapseStatsMobile}
                      onChange={() => handleConfigChange('collapseStatsMobile', !localConfig.collapseStatsMobile)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Desktop</span>
                    <ToggleSwitch
                      checked={!!localConfig.collapseStatsDesktop}
                      onChange={() => handleConfigChange('collapseStatsDesktop', !localConfig.collapseStatsDesktop)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
            <h4 className="text-lg font-bold mb-4 dark:text-white flex items-center">
              <Globe size={20} className="mr-2" /> Regional Settings
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
              <input
                type="text"
                value={localConfig.timezone}
                onChange={(e) => handleConfigChange('timezone', e.target.value)}
                className={`w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${timezoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="e.g. UTC, America/New_York"
              />
              {timezoneError ? (
                <p className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs mt-1.5 font-semibold">
                  <AlertCircle size={13} /> {timezoneError}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Must be a valid timezone.{' '}
                  <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    See List
                  </a>
                </p>
              )}
            </div>
          </div>
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