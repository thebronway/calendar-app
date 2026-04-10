import React, { useState, useEffect } from 'react';
import { Settings, X, Layout, Globe, Save } from 'lucide-react';
import { ICON_KEYS, ICON_MAP } from '../utils/constants';

const SettingsModal = ({ isOpen, onClose, config, onConfigSave }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleConfigChange = (field, value) =>
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
  const handleSave = () => {
    onConfigSave(localConfig);
    onClose();
  };

  const headerIcons = ICON_KEYS.filter(
    (k) =>
      k.startsWith('Calendar') ||
      ['Star', 'Heart', 'Home', 'Activity'].includes(k) ||
      localConfig.headerIcon === k
  );

  const generateText = (style) => {
    const y = new Date().getFullYear();
    const n = localConfig.ownerName || 'Name';
    switch (style) {
      case 'possessive':
        return `${n}'s Calendar`;
      case 'question':
        return `Where is ${n} in ${y}?`;
      default:
        return `${y} Calendar`;
    }
  };

  const activeHeaderStyle = localConfig.headerStyle || 'simple';
  const activeBrowserStyle = localConfig.browserTitleStyle || 'simple';
  const HeaderIcon = ICON_MAP[localConfig.headerIcon || 'CalendarDays'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-xl">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <Settings size={24} className="mr-3 text-blue-500" /> Settings
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
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
                  {React.createElement(HeaderIcon, { size: 32 })}
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
                    onClick={() => handleConfigChange('headerStyle', opt.id)}
                    className={`p-3 text-left rounded-lg border text-sm font-medium transition-all ${activeHeaderStyle === opt.id ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-900 border dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Live Preview</span>
                <h1 className="text-2xl font-extrabold flex items-center text-gray-900 dark:text-white">
                  {React.createElement(HeaderIcon, { size: 28, className: 'mr-3 text-blue-600' })}
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
                    onClick={() => handleConfigChange('browserTitleStyle', opt.id)}
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
              <Globe size={20} className="mr-2" /> Regional Settings
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
              <input
                type="text"
                value={localConfig.timezone}
                onChange={(e) => handleConfigChange('timezone', e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g. UTC, America/New_York"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be a valid timezone.{' '}
                <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  See List
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end space-x-3 rounded-b-xl">
          <button onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50">
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