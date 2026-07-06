import React from 'react';
import type { AppConfig } from '../types';

interface ThemeStyleInjectorProps {
  config: AppConfig;
}

const hexToRgbString = (hex: string): string => {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(char => char + char).join('');
  if (cleanHex.length !== 6) return '59 130 246'; 
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return `${r} ${g} ${b}`;
};

const ThemeStyleInjector: React.FC<ThemeStyleInjectorProps> = ({ config }) => {
  return (
    <style>
      {`
        :root {
          --theme-bg: ${config.themeBgLight || '#e5e7eb'};
          --theme-panel-bg: #ffffff;
          --theme-text-primary: #111827;
          --theme-text-secondary: #6b7280;
          --theme-accent-rgb: ${hexToRgbString(config.themeAccentLight || '#3b82f6')};
          --theme-accent-secondary-rgb: ${hexToRgbString(config.themeAccentSecondaryLight || '#8b5cf6')};
          --theme-item-bg: #f3f4f6;
          --theme-item-hover: #e5e7eb;
        }
        .dark {
          --theme-bg: ${config.themeBgDark || '#111827'};
          --theme-panel-bg: #1f2937;
          --theme-text-primary: #f3f4f6;
          --theme-text-secondary: #9ca3af;
          --theme-accent-rgb: ${hexToRgbString(config.themeAccentDark || '#3b82f6')};
          --theme-accent-secondary-rgb: ${hexToRgbString(config.themeAccentSecondaryDark || '#8b5cf6')};
          --theme-item-bg: #2b3544;
          --theme-item-hover: #374151;
        }
        .custom-theme {
          --theme-bg: ${config.customBg || '#111827'};
          --theme-panel-bg: ${config.customPanelBg || '#1f2937'};
          --theme-text-primary: ${config.customTextPrimary || '#f3f4f6'};
          --theme-text-secondary: ${config.customTextSecondary || '#9ca3af'};
          --theme-accent-rgb: ${hexToRgbString(config.customAccent || '#3b82f6')};
          --theme-accent-text: ${config.customAccentText || '#ffffff'};
          --theme-accent-secondary-rgb: ${hexToRgbString(config.customAccentSecondary || '#8b5cf6')};
          --theme-item-bg: ${config.customItemBg || '#374151'};
          --theme-item-hover: ${config.customItemHoverBg || '#4b5563'};
        }
      `}
    </style>
  );
};

export default ThemeStyleInjector;