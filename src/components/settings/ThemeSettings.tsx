import React, { useState } from 'react';
import { Palette, RotateCcw, Sun, Moon } from 'lucide-react';
import type { AppConfig } from '../../types';

interface ThemeSettingsProps {
  config: AppConfig;
  onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void;
}

const ColorInput = ({ label, description, value, field, onConfigChange }: { label: string, description: string, value: string, field: keyof AppConfig, onConfigChange: <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => void }) => (
  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700 flex items-center justify-between">
    <div>
      <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">{label}</span>
      <span className="block text-xs text-gray-500 mt-0.5">{description}</span>
    </div>
    <input 
      type="color" 
      value={value} 
      onChange={(e) => onConfigChange(field, e.target.value)}
      className="w-10 h-10 p-0 border-0 rounded cursor-pointer shrink-0"
    />
  </div>
);

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ config, onConfigChange }) => {
  const [activeTab, setActiveTab] = useState<'light' | 'dark' | 'custom'>('light');

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
    }
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
          <RotateCcw size={14} /> Reset {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Defaults
        </button>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Personalize the look of your calendar modes independently. Changes will be visible immediately upon saving.
      </p>

      {/* Tabs */}
      <div className="flex mb-6 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('light')}
          className={`flex-1 py-2 text-sm font-bold flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'light' ? 'border-pink-500 text-pink-600 dark:text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <Sun size={16} /> Light
        </button>
        <button
          onClick={() => setActiveTab('dark')}
          className={`flex-1 py-2 text-sm font-bold flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'dark' ? 'border-pink-500 text-pink-600 dark:text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <Moon size={16} /> Dark
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-2 text-sm font-bold flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'custom' ? 'border-pink-500 text-pink-600 dark:text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <Palette size={16} /> Custom
        </button>
      </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorInput label="Main Background" description="Overarching canvas." value={config.customBg || '#111827'} field="customBg" onConfigChange={onConfigChange} />
            <ColorInput label="Panel Background" description="Cards, modals, and grids." value={config.customPanelBg || '#1f2937'} field="customPanelBg" onConfigChange={onConfigChange} />
            <ColorInput label="Primary Text" description="Headings and main body." value={config.customTextPrimary || '#f3f4f6'} field="customTextPrimary" onConfigChange={onConfigChange} />
            <ColorInput label="Accent Contrast Text" description="Text sitting on top of the accent." value={config.customAccentText || '#ffffff'} field="customAccentText" onConfigChange={onConfigChange} />
            <ColorInput label="Primary Accent" description="Main highlights and search filters." value={config.customAccent || '#3b82f6'} field="customAccent" onConfigChange={onConfigChange} />
            <ColorInput label="Secondary Accent" description="Bulk edit selections and secondary stats." value={config.customAccentSecondary || '#8b5cf6'} field="customAccentSecondary" onConfigChange={onConfigChange} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeSettings;