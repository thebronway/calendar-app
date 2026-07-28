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
          --theme-grid-divider: #d1d5db;
          --theme-grid-header: #e5e7eb;
          --theme-grid-cell: #f9fafb;
          --theme-grid-empty: #ffffff;
          --theme-grid-text-highlighted: rgba(17, 24, 39, 0.9);
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
          --theme-grid-divider: #374151;
          --theme-grid-header: rgba(31, 41, 55, 0.6);
          --theme-grid-cell: #1f2937;
          --theme-grid-empty: rgba(31, 41, 55, 0.3);
          --theme-grid-text-highlighted: rgba(17, 24, 39, 0.9);
        }
        .custom-theme {
          --theme-bg: ${config.customBg || '#052e16'};
          --theme-panel-bg: ${config.customPanelBg || '#064e3b'};
          --theme-text-primary: ${config.customTextPrimary || '#ecfdf5'};
          --theme-text-secondary: ${config.customTextSecondary || '#a7f3d0'};
          --theme-accent-rgb: ${hexToRgbString(config.customAccent || '#10b981')};
          --theme-accent-text: ${config.customAccentText || '#064e3b'};
          --theme-accent-secondary-rgb: ${hexToRgbString(config.customAccentSecondary || '#f59e0b')};
          --theme-item-bg: ${config.customItemBg || '#065f46'};
          --theme-item-hover: ${config.customItemHoverBg || '#047857'};
          --theme-grid-divider: ${config.customGridDivider || '#065f46'};
          --theme-grid-header: ${config.customGridHeaderBg || '#064e3b'};
          --theme-grid-cell: ${config.customGridCellBg || '#052e16'};
          --theme-grid-empty: ${config.customGridEmptyBg || '#022c22'};
          --theme-grid-text-highlighted: ${config.customGridTextHighlighted || '#022c22'};
        }
      `}
    </style>
  );
};

export default ThemeStyleInjector;