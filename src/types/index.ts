import type { LucideIcon } from 'lucide-react';

// --- Config ---

export type HeaderStyle = 'simple' | 'possessive' | 'question';
export type BrowserTitleStyle = 'simple' | 'possessive' | 'question';

export interface AppConfig {
  timezone: string;
  headerStyle: HeaderStyle;
  browserTitleStyle: BrowserTitleStyle;
  ownerName: string;
  headerIcon: string;
  bannerHtml?: string | null;
  autoScrollMobile?: boolean;
  autoScrollDesktop?: boolean;
  collapseKeyMobile?: boolean;
  collapseKeyDesktop?: boolean;
  collapseStatsMobile?: boolean;
  collapseStatsDesktop?: boolean;
  viewMode?: 'public' | 'private';
  loginMessage?: string;
  sessionTimeout?: number;
  statsVisibility?: 'all' | 'admin' | 'none';
  gaId?: string;
  umamiId?: string;
  umamiUrl?: string;
  lastSeenVersion?: string;
  isDemoMode?: boolean;
  demoAdminPass?: string;
  demoGuestPass?: string;
}

// --- Calendar Data ---

export interface IconEntry {
  value?: string;
  icon?: string;
  color: string;
  displayName?: string;
}

export interface DayData {
  day: number;
  month: string;
  year: number;
  colorId: string;
  icons: IconEntry[];
  locations: string;
  details: string;
}

export type CalendarDataset = Record<string, DayData>;

// --- Key Items ---

export interface KeyItem {
  id: string;
  label: string;
  isColorKey: boolean;
  colorCode?: string;
  icon?: string;
  iconColor?: string;
  showCount?: boolean;
}

// --- Auth ---

export type Role = 'admin' | 'view' | 'none';

// --- Category / Icon Map ---

export interface CategoryColor {
  id: string;
  label: string;
  bg: string;
  border: string;
}

export interface IconColorOption {
  id: string;
  class: string;
  bg: string;
  label: string;
}

export type IconMap = Record<string, LucideIcon | null>;

// --- Filters ---

export interface IconFilter {
  icon: string;
  iconColor: string;
}

export interface HighlightFilters {
  locations: string[];
  icons: IconFilter[];
  categories: string[];
}

// --- Stats ---

export interface CalendarStats {
  totalDays: number;
  categories: Record<string, number>;
  totalHighlighted: number;
}

// --- WebSocket Messages ---

export interface DataUpdateMessage {
  type: 'DATA_UPDATE';
  payload: {
    year: number;
    data: {
      dayData: CalendarDataset;
      keyItems: KeyItem[];
      lastUpdatedText: string;
    };
  };
}

export interface ConfigUpdateMessage {
  type: 'CONFIG_UPDATE';
  payload: AppConfig;
}

export type WsMessage = DataUpdateMessage | ConfigUpdateMessage;
