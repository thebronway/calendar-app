import React, { useState } from 'react';
import { Palette, RotateCcw, Sun, Moon } from 'lucide-react';
import type { AppConfig } from '../../types';
import type { ThemeMode } from '../../hooks/useTheme';

interface ThemeSettingsProps {
  config: AppConfig;
  onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void;
  currentTheme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
}

const ColorInput = ({ label, description, value, field, onConfigChange }: { label: string, description: string, value: string, field: keyof AppConfig, onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void }) => (
  <div className="bg-theme-item p-4 rounded-lg border border-theme-item flex items-center justify-between">
    <div>
      <span className="block text-sm font-bold text-theme-text">{label}</span>
      <span className="block text-xs text-theme-text-secondary mt-0.5">{description}</span>
    </div>
    <input 
      type="color" 
      value={value} 
      onChange={(e) => onConfigChange(field, e.target.value)}
      className="w-10 h-10 p-0 border-0 rounded cursor-pointer shrink-0 bg-transparent"
    />
  </div>
);

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ config, onConfigChange, currentTheme, setTheme }) => {
  const [activeTab, setActiveTab] = useState<'light' | 'dark' | 'custom'>(currentTheme);

  // Keep the local tab synced if the global theme changes externally
  React.useEffect(() => {
    setActiveTab(currentTheme);
  }, [currentTheme]);

  const handleTabChange = (mode: 'light' | 'dark' | 'custom') => {
    setActiveTab(mode);
    setTheme(mode); // Instantly preview the mode in the background!
  };

  const handleReset = () => {
    if (activeTab === 'light') {
      onConfigChange('themeBgLight', '#e5e7eb');
      onConfigChange('themeAccentLight', '#3b82f6');
      onConfigChange('themeAccentSecondaryLight', '#8b5cf6');
    } else if (activeTab === 'dark') {
      onConfigChange('themeBgDark', '#111827');
      onConfigChange('themeAccentDark', '#3b82f6');
      onConfigChange('themeAccentSecondaryDark', '#8b5cf6');
    } else if (activeTab === 'custom') {
      onConfigChange('customBg', '#111827');
      onConfigChange('customAccent', '#3b82f6');
      onConfigChange('customAccentSecondary', '#8b5cf6');
      onConfigChange('customItemBg', '#374151');
      onConfigChange('customItemHoverBg', '#4b5563');
      onConfigChange('customTextSecondary', '#9ca3af');
      onConfigChange('customGridDivider', '#374151');
      onConfigChange('customGridHeaderBg', '#2b3544');
      onConfigChange('customGridCellBg', '#1f2937');
      onConfigChange('customGridEmptyBg', '#111827');
      onConfigChange('customGridTextHighlighted', '#111827');
    }
  };

  return (
    <div className="bg-theme-panel p-6 rounded-xl shadow-sm border border-theme-item">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold text-theme-text flex items-center">
          <Palette size={20} className="mr-2 text-pink-500" /> Custom Themeing
        </h4>
        <button 
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-bold text-theme-text-secondary hover:text-theme-text transition-colors"
        >
          <RotateCcw size={14} /> Reset {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Defaults
        </button>
      </div>
      
      <p className="text-sm text-theme-text-secondary mb-6">
        Personalize the look of your calendar modes independently. Changes will be visible immediately upon saving.
      </p>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-theme-item">
        <button
          onClick={() => handleTabChange('light')}
          className={`flex-1 py-2 text-sm font-bold flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'light' ? 'border-amber-400 text-amber-500' : 'border-transparent text-theme-text-secondary hover:text-amber-500'}`}
        >
          <Sun size={16} /> Light
        </button>
        <button
          onClick={() => handleTabChange('dark')}
          className={`flex-1 py-2 text-sm font-bold flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'dark' ? 'border-gray-800 text-gray-900 dark:border-gray-300 dark:text-gray-200' : 'border-transparent text-theme-text-secondary hover:text-gray-800 dark:hover:text-gray-300'}`}
        >
          <Moon size={16} /> Dark
        </button>
        <button
          onClick={() => handleTabChange('custom')}
          className={`flex-1 py-2 text-sm font-bold flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'custom' ? 'border-pink-500' : 'border-transparent text-theme-text-secondary hover:border-pink-300'}`}
        >
          <Palette size={16} className={activeTab === 'custom' ? 'text-pink-500' : ''} />
          <span className="flex">
            <span className={activeTab === 'custom' ? 'text-red-500' : ''}>C</span>
            <span className={activeTab === 'custom' ? 'text-orange-500' : ''}>u</span>
            <span className={activeTab === 'custom' ? 'text-yellow-500' : ''}>s</span>
            <span className={activeTab === 'custom' ? 'text-green-500' : ''}>t</span>
            <span className={activeTab === 'custom' ? 'text-blue-500' : ''}>o</span>
            <span className={activeTab === 'custom' ? 'text-purple-500' : ''}>m</span>
          </span>
        </button>
      </div>

      {activeTab !== 'custom' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            <span className="font-bold uppercase tracking-wider text-[10px] mr-1.5 opacity-80">Note:</span> 
            {activeTab === 'light' ? 'Light' : 'Dark'} mode offers simplified accent configurations. For full granular control over panels, grids, and typography, select the <strong>Custom</strong> theme!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {activeTab === 'light' && (
          <>
            <ColorInput label="Background" description="The main app background." value={config.themeBgLight || '#e5e7eb'} field="themeBgLight" onConfigChange={onConfigChange} />
            <ColorInput label="Primary Accent" description="Main highlights and search filters." value={config.themeAccentLight || '#3b82f6'} field="themeAccentLight" onConfigChange={onConfigChange} />
            <ColorInput label="Secondary Accent" description="Bulk edit selections and secondary stats." value={config.themeAccentSecondaryLight || '#8b5cf6'} field="themeAccentSecondaryLight" onConfigChange={onConfigChange} />
          </>
        )}

        {activeTab === 'dark' && (
          <>
            <ColorInput label="Background" description="The main app background." value={config.themeBgDark || '#111827'} field="themeBgDark" onConfigChange={onConfigChange} />
            <ColorInput label="Primary Accent" description="Main highlights and search filters." value={config.themeAccentDark || '#3b82f6'} field="themeAccentDark" onConfigChange={onConfigChange} />
            <ColorInput label="Secondary Accent" description="Bulk edit selections and secondary stats." value={config.themeAccentSecondaryDark || '#8b5cf6'} field="themeAccentSecondaryDark" onConfigChange={onConfigChange} />
          </>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-6">
            <div>
              <h5 className="text-sm font-bold text-theme-text mb-3 border-b border-theme-item pb-1">Base & Panels</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorInput label="Main Background" description="Overarching canvas." value={config.customBg || '#111827'} field="customBg" onConfigChange={onConfigChange} />
                <ColorInput label="Panel Background" description="Cards, modals, and grids." value={config.customPanelBg || '#1f2937'} field="customPanelBg" onConfigChange={onConfigChange} />
                <ColorInput label="Item Background" description="Category and activity buttons." value={config.customItemBg || '#374151'} field="customItemBg" onConfigChange={onConfigChange} />
                <ColorInput label="Item Hover" description="Hover state for items/buttons." value={config.customItemHoverBg || '#4b5563'} field="customItemHoverBg" onConfigChange={onConfigChange} />
              </div>
            </div>

            <div>
              <h5 className="text-sm font-bold text-theme-text mb-3 border-b border-theme-item pb-1">Accents & Highlights</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorInput label="Primary Accent" description="Main highlights and search filters." value={config.customAccent || '#3b82f6'} field="customAccent" onConfigChange={onConfigChange} />
                <ColorInput label="Secondary Accent" description="Bulk edit selections and secondary stats." value={config.customAccentSecondary || '#8b5cf6'} field="customAccentSecondary" onConfigChange={onConfigChange} />
              </div>
            </div>

            <div>
              <h5 className="text-sm font-bold text-theme-text mb-3 border-b border-theme-item pb-1">Typography</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorInput label="Primary Text" description="Headings and main body." value={config.customTextPrimary || '#f3f4f6'} field="customTextPrimary" onConfigChange={onConfigChange} />
                <ColorInput label="Secondary Text" description="Subheadings and less prominent text." value={config.customTextSecondary || '#9ca3af'} field="customTextSecondary" onConfigChange={onConfigChange} />
                <ColorInput label="Accent Contrast Text" description="Text sitting on top of the accent." value={config.customAccentText || '#ffffff'} field="customAccentText" onConfigChange={onConfigChange} />
              </div>
            </div>

            <div>
              <h5 className="text-sm font-bold text-theme-text mb-3 border-b border-theme-item pb-1">Calendar Grid</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorInput label="Grid Header" description="Days of the week row." value={config.customGridHeaderBg || '#2b3544'} field="customGridHeaderBg" onConfigChange={onConfigChange} />
                <ColorInput label="Grid Cell" description="Numbered day background." value={config.customGridCellBg || '#1f2937'} field="customGridCellBg" onConfigChange={onConfigChange} />
                <ColorInput label="Grid Divider" description="Borders between cells." value={config.customGridDivider || '#374151'} field="customGridDivider" onConfigChange={onConfigChange} />
                <ColorInput label="Grid Highlighted Text" description="Text color for days with a category." value={config.customGridTextHighlighted || '#111827'} field="customGridTextHighlighted" onConfigChange={onConfigChange} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeSettings;