import React, { useState } from 'react';
import { Layout } from 'lucide-react';
import { ICON_KEYS, ICON_MAP } from '../../utils/constants';
import type { AppConfig } from '../../types';

interface AppearanceSettingsProps {
  config: AppConfig;
  onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ config, onConfigChange }) => {
  const [showIconPicker, setShowIconPicker] = useState(false);

  const headerIcons = ICON_KEYS.filter(
    (k) =>
      k.startsWith('Calendar') ||
      ['Star', 'Heart', 'Home', 'Activity'].includes(k) ||
      config.headerIcon === k
  );

  const generateText = (style: string) => {
    const y = new Date().getFullYear();
    const n = config.ownerName || 'Name';
    if (style === 'possessive') return `${n}'s Calendar`;
    if (style === 'question') return `Where is ${n} in ${y}?`;
    return `${y} Calendar`;
  };

  const activeHeaderStyle = config.headerStyle || 'simple';
  const activeBrowserStyle = config.browserTitleStyle || 'simple';
  const HeaderIcon = ICON_MAP[config.headerIcon || 'CalendarDays'];

  return (
    <div className="bg-theme-panel p-6 rounded-xl shadow-sm border border-theme-item">
      <h4 className="text-lg font-bold mb-4 text-theme-text flex items-center">
        <Layout size={20} className="mr-2" /> Page Appearance
      </h4>

      <div className="mb-6">
        <label className="block text-sm font-medium text-theme-text-secondary mb-2">Main Page Icon</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center bg-transparent rounded-xl border-2 border-theme-accent text-theme-accent shadow-sm">
            {HeaderIcon && <HeaderIcon size={32} />}
          </div>
          <button
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="bg-theme-item hover:bg-theme-item-hover text-theme-text px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Change Icon
          </button>
        </div>
        {showIconPicker && (
          <div className="mt-4 p-4 bg-theme-item rounded-lg border border-theme-item grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-40 overflow-y-auto">
            {headerIcons.map((key) => {
              const Icon = ICON_MAP[key];
              if (!Icon) return null;
              return (
                <button
                  key={key}
                  onClick={() => {
                    onConfigChange('headerIcon', key);
                    setShowIconPicker(false);
                  }}
                  className={`p-2 rounded flex justify-center transition-colors ${config.headerIcon === key ? 'bg-theme-accent/20 text-theme-accent ring-2 ring-theme-accent' : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-item-hover'}`}
                >
                  <Icon size={20} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-theme-text-secondary mb-2">Page Header Title</label>
        <div className="grid grid-cols-1 gap-2 mb-4">
          {[
            { id: 'simple', label: '<Year> Calendar' },
            { id: 'possessive', label: "<Name>'s Calendar" },
            { id: 'question', label: 'Where is <Name> in <Year>?' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => onConfigChange('headerStyle', opt.id as AppConfig['headerStyle'])}
              className={`p-3 text-left rounded-lg border text-sm font-medium transition-all ${activeHeaderStyle === opt.id ? 'bg-theme-accent/10 border-theme-accent text-theme-accent' : 'bg-theme-item border-theme-item text-theme-text hover:bg-theme-item-hover'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="p-4 bg-theme-item border border-theme-item rounded-lg flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-theme-text-secondary uppercase mb-2 tracking-wider">Live Preview</span>
          <h1 className="text-2xl font-extrabold flex items-center text-theme-text">
            {HeaderIcon && <HeaderIcon size={28} className="mr-3 text-theme-accent" />}
            <span>{generateText(activeHeaderStyle)}</span>
          </h1>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-theme-text-secondary mb-2">Browser Tab Title</label>
        <div className="grid grid-cols-1 gap-2 mb-4">
          {[
            { id: 'simple', label: '<Year> Calendar' },
            { id: 'possessive', label: "<Name>'s Calendar" },
            { id: 'question', label: 'Where is <Name> in <Year>?' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => onConfigChange('browserTitleStyle', opt.id as AppConfig['browserTitleStyle'])}
              className={`p-3 text-left rounded-lg border text-sm font-medium transition-all ${activeBrowserStyle === opt.id ? 'bg-theme-accent-secondary/10 border-theme-accent-secondary text-theme-accent-secondary' : 'bg-theme-item border-theme-item text-theme-text hover:bg-theme-item-hover'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="p-4 bg-theme-base rounded-lg border border-theme-item shadow-inner">
          <span className="block text-xs font-bold text-theme-text-secondary uppercase mb-2 tracking-wider text-center">Browser Tab Preview</span>
          <div className="bg-theme-item p-2 rounded-t-lg flex items-center gap-2 border border-theme-grid-divider border-b-0">
            <div className="bg-theme-panel text-theme-text px-3 py-1.5 rounded-t-md text-xs font-medium flex items-center shadow-sm w-48">
              <div className="w-2 h-2 bg-theme-accent rounded-full mr-2 shrink-0"></div>
              <span className="truncate">{generateText(activeBrowserStyle)}</span>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-theme-text-secondary opacity-50"></div>
              <div className="w-2 h-2 rounded-full bg-theme-text-secondary opacity-50"></div>
            </div>
          </div>
          <div className="bg-theme-panel h-8 border border-theme-grid-divider border-t-0 rounded-b-lg"></div>
        </div>
      </div>

      {(activeHeaderStyle !== 'simple' || activeBrowserStyle !== 'simple') && (
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary mb-1">Name</label>
          <input
            type="text"
            value={config.ownerName || ''}
            onChange={(e) => onConfigChange('ownerName', e.target.value)}
            className="w-full p-2 border border-theme-item rounded-lg bg-theme-item text-theme-text focus:outline-none focus:border-theme-accent transition-colors"
            placeholder="e.g. John"
          />
        </div>
      )}
    </div>
  );
};

export default AppearanceSettings;