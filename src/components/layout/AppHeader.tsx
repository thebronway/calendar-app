import React from 'react';
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Key,
  Loader,
  Lock,
  LogOut,
  Moon,
  Settings,
  Sun,
} from 'lucide-react';
import { ICON_MAP, MONTHS } from '../../utils/constants';
import { slugify } from '../../utils/helpers';
import type { AppConfig, Role } from '../../types';

interface AppHeaderProps {
  year: number;
  config: AppConfig;
  role: Role;
  isDarkMode: boolean;
  isSaving: boolean;
  isBulkEditMode: boolean;
  lastUpdatedText: string;
  hasFilters: boolean;
  routeView?: string;
  onClearFilters: () => void;
  onViewToggle: (view: 'year' | 'planner') => void;
  onYearPrev: () => void;
  onYearNext: () => void;
  onToggleDarkMode: () => void;
  onToggleBulkEdit: () => void;
  onOpenKeyModal: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenHelp: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  year,
  config,
  role,
  isDarkMode,
  isSaving,
  isBulkEditMode,
  lastUpdatedText,
  hasFilters,
  routeView,
  onClearFilters,
  onViewToggle,
  onYearPrev,
  onYearNext,
  onToggleDarkMode,
  onToggleBulkEdit,
  onOpenKeyModal,
  onOpenSettings,
  onLogout,
  onOpenAuth,
  onOpenHelp,
}) => {
  const renderTitle = () => {
    const n = config.ownerName || 'Name';
    const style = config.headerStyle || 'simple';
    if (style === 'possessive') return <>{n}'s Calendar</>;
    if (style === 'question')
      return (
        <>
          Where is {n} in <span className="text-blue-600">{year}</span>?
        </>
      );
    return (
      <>
        <span className="text-blue-600 mr-2">{year}</span> Calendar
      </>
    );
  };

  const HeaderIcon = ICON_MAP[config.headerIcon || 'CalendarDays'];

  return (
    <header className="mb-8 border-b dark:border-gray-700 pb-4">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl sm:text-4xl font-extrabold flex items-center text-center sm:text-left">
          {HeaderIcon && (
            <HeaderIcon size={36} className="mr-3 text-blue-600 hidden sm:block" />
          )}
          <span>{renderTitle()}</span>
        </h1>

        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 sm:gap-4 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
            <button onClick={onYearPrev} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold whitespace-nowrap">
              {(() => {
                if (!routeView || routeView === 'year' || routeView === 'list' || routeView === 'planner') return year;
                const monthName = MONTHS.find(m => slugify(m) === routeView);
                return monthName ? `${monthName} ${year}` : year;
              })()}
            </span>
            <button onClick={onYearNext} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <ChevronRight size={20} />
            </button>
          </div>

          {(!routeView || routeView === 'year' || routeView === 'planner') && (
            <div className="hidden sm:flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg items-center shadow-inner">
              <button
                onClick={() => onViewToggle('year')}
                className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${(!routeView || routeView === 'year') ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                Year
              </button>
              <button
                onClick={() => onViewToggle('planner')}
                className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${routeView === 'planner' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                Planner
              </button>
            </div>
          )}

          {hasFilters && (
            <button
              onClick={onClearFilters} 
              className="px-3 h-10 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-lg text-sm font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
            >
              View Full Calendar
            </button>
          )}

          <button
            onClick={onOpenHelp}
            className="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Help & Shortcuts"
          >
            <HelpCircle size={20} />
          </button>

          <button
            onClick={onToggleDarkMode}
            className="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {role === 'admin' ? (
            <>
              <button
                onClick={onToggleBulkEdit}
                className={`h-10 w-10 sm:w-auto sm:px-4 flex items-center justify-center text-white rounded-lg transition-all ${
                  isBulkEditMode ? 'bg-indigo-700 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-900' : 'bg-indigo-500 hover:bg-indigo-600'
                }`}
                title="Bulk Edit"
              >
                <CalendarRange size={20} className="sm:mr-2" />
                <span className="hidden sm:inline">
                  {isBulkEditMode ? 'Cancel Bulk' : 'Bulk Edit'}
                </span>
              </button>
              <button
                onClick={onOpenKeyModal}
                className="h-10 w-10 sm:w-auto sm:px-4 flex items-center justify-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Edit Key"
              >
                <Key size={20} className="sm:mr-2" />
                <span className="hidden sm:inline">Key</span>
              </button>
              <button
                onClick={onOpenSettings}
                className="h-10 w-10 sm:w-auto sm:px-4 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Settings"
              >
                <Settings size={20} className="sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={onLogout}
                className="h-10 w-10 sm:w-auto sm:px-4 flex items-center justify-center bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                title="Logout"
              >
                <LogOut size={20} className="sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Lock size={20} />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center justify-center sm:justify-start">
        <span className="mr-2">Last updated:</span>
        <span className="font-semibold">{lastUpdatedText}</span>
        {isSaving && (
          <span className="ml-2 text-xs text-blue-500 flex items-center">
            <Loader size={12} className="mr-1 animate-spin" /> Saving...
          </span>
        )}
      </p>
    </header>
  );
};

export default AppHeader;
