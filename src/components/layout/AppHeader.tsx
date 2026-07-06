import React from 'react';
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Key,
  Loader,
  Lock,
  LogOut,
  Moon,
  Palette,
  Rss,
  Settings,
  Sun,
} from 'lucide-react';
import { ICON_MAP, MONTHS } from '../../utils/constants';
import { slugify } from '../../utils/helpers';
import type { AppConfig, Role } from '../../types';
import type { ThemeMode } from '../../hooks/useTheme';

interface AppHeaderProps {
  year: number;
  config: AppConfig;
  role: Role;
  themeMode: ThemeMode;
  isSaving: boolean;
  lastUpdatedText: string;
  hasFilters: boolean;
  routeView?: string;
  hasPublicFeeds: boolean;
  onClearFilters: () => void;
  onViewToggle: (view: 'year' | 'planner' | 'list') => void;
  onYearPrev: () => void;
  onYearNext: () => void;
  onCycleTheme: () => void;
  onOpenFeeds: () => void;
  onOpenHelp: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onGoToGuide: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  year,
  config,
  role,
  themeMode,
  isSaving,
  lastUpdatedText,
  hasFilters,
  routeView,
  hasPublicFeeds,
  onClearFilters,
  onViewToggle,
  onYearPrev,
  onYearNext,
  onCycleTheme,
  onOpenFeeds,
  onOpenHelp,
  onLogout,
  onOpenAuth,
  onGoToGuide,
}) => {
  const renderTitle = () => {
    const n = config.ownerName || 'Name';
    const style = config.headerStyle || 'simple';
    if (style === 'possessive') return <>{n}'s Calendar</>;
    if (style === 'question')
      return (
        <>
          Where is {n} in <span className="text-theme-accent">{year}</span>?
        </>
      );
    return (
      <>
        <span className="text-theme-accent mr-2">{year}</span> Calendar
      </>
    );
  };

  const HeaderIcon = ICON_MAP[config.headerIcon || 'CalendarDays'];

  return (
    <header className="mb-8 border-b dark:border-gray-700 pb-4">
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start">
        
        {/* LEFT COLUMN: Title & Last Updated */}
        <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-4xl font-extrabold flex items-center text-center sm:text-left">
            {HeaderIcon && (
              <HeaderIcon size={36} className="mr-3 text-theme-accent hidden sm:block" />
            )}
            <span>{renderTitle()}</span>
          </h1>

          {routeView !== 'guide' && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-3 flex items-center justify-center sm:justify-start">
              <span className="mr-2">Last updated:</span>
              <span className="font-semibold">{lastUpdatedText}</span>
              {isSaving && (
                <span className="ml-2 text-xs text-blue-500 flex items-center">
                  <Loader size={12} className="mr-1 animate-spin" /> Saving...
                </span>
              )}
            </p>
          )}
        </div>

        {/* RIGHT COLUMN: Controls */}
        <div className="w-full sm:w-auto flex flex-col items-center sm:items-end">
          {routeView === 'guide' ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onViewToggle('year')}
                className="h-10 px-4 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-bold text-sm"
              >
                <ChevronLeft size={16} className="mr-1" /> Back to Calendar
              </button>
              <button
                onClick={onCycleTheme}
                className="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {themeMode === 'dark' ? <Moon size={20} /> : themeMode === 'custom' ? <Palette size={20} /> : <Sun size={20} />}
              </button>
            </div>
          ) : (
            <>
              {/* LINE 1 CONTROLS */}
              <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 sm:gap-4">
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                  <button onClick={onYearPrev} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-semibold whitespace-nowrap">
                    {(() => {
                      const shortYear = year.toString().slice(-2);
                      if (!routeView || routeView === 'year' || routeView === 'list' || routeView === 'planner') {
                        return (
                          <>
                            <span className="hidden sm:inline">{year}</span>
                            <span className="sm:hidden">{shortYear}</span>
                          </>
                        );
                      }
                      const monthName = MONTHS.find(m => slugify(m) === routeView);
                      return monthName ? (
                        <>
                          <span className="hidden sm:inline">{monthName} {year}</span>
                          <span className="sm:hidden">{monthName.slice(0, 3)} {shortYear}</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">{year}</span>
                          <span className="sm:hidden">{shortYear}</span>
                        </>
                      );
                    })()}
                  </span>
                  <button onClick={onYearNext} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                    <ChevronRight size={20} />
                  </button>
                </div>

                {(!routeView || routeView === 'year' || routeView === 'planner' || routeView === 'list') && (
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg items-center shadow-inner">
                    <button
                      onClick={() => onViewToggle('year')}
                      className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${(!routeView || routeView === 'year') ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                      <span className="hidden sm:inline">Year</span>
                      <span className="sm:hidden">Yr</span>
                    </button>
                    <button
                      onClick={() => onViewToggle('planner')}
                      className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${routeView === 'planner' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                      <span className="hidden sm:inline">Planner</span>
                      <span className="sm:hidden">Plan</span>
                    </button>
                    <button
                      onClick={() => onViewToggle('list')}
                      className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${routeView === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                      <span className="hidden sm:inline">List</span>
                      <span className="sm:hidden">List</span>
                    </button>
                  </div>
                )}

                {hasFilters && (
                  <button
                    onClick={onClearFilters} 
                    className="px-3 h-10 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-lg text-sm font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors flex items-center justify-center"
                  >
                    <span className="hidden sm:inline">Clear Filters</span>
                    <span className="sm:hidden">Clear</span>
                  </button>
                )}

                {/* ICONS ON LINE 1 (Desktop Only) */}
                <div className="hidden sm:flex items-center gap-3">
                  <button
                    onClick={onOpenHelp}
                    className="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Help & Shortcuts"
                  >
                    <HelpCircle size={20} />
                  </button>

                  {role === 'admin' && (
                    <button
                      onClick={onGoToGuide}
                      className="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="User Guide"
                    >
                      <BookOpen size={20} />
                    </button>
                  )}

                  <button
                    onClick={onCycleTheme}
                    className="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {themeMode === 'dark' ? <Moon size={20} /> : themeMode === 'custom' ? <Palette size={20} /> : <Sun size={20} />}
                  </button>

                  {hasPublicFeeds && role !== 'admin' && (
                    <button
                      onClick={onOpenFeeds}
                      className="h-10 w-10 flex items-center justify-center bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      title="Subscribe"
                    >
                      <Rss size={20} />
                    </button>
                  )}
                  {role !== 'none' ? (
                    <button
                      onClick={onLogout}
                      className="h-10 w-10 flex items-center justify-center bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={onOpenAuth}
                      className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Log In"
                    >
                      <Lock size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* LINE 2 CONTROLS */}
              <div className={`flex flex-wrap justify-center sm:justify-end items-center gap-3 sm:gap-4 mt-4 ${role === 'admin' ? '' : 'sm:hidden'}`}>
                
                {/* ICONS ON LINE 2 (Mobile Only) */}
                <div className="flex sm:hidden items-center gap-3">
                  <button
                    onClick={onOpenHelp}
                    className="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Help & Shortcuts"
                  >
                    <HelpCircle size={20} />
                  </button>

                  {role === 'admin' && (
                    <button
                      onClick={onGoToGuide}
                      className="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="User Guide"
                    >
                      <BookOpen size={20} />
                    </button>
                  )}

                  <button
                    onClick={onCycleTheme}
                    className="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {themeMode === 'dark' ? <Moon size={20} /> : themeMode === 'custom' ? <Palette size={20} /> : <Sun size={20} />}
                  </button>

                  {hasPublicFeeds && role !== 'admin' && (
                    <button
                      onClick={onOpenFeeds}
                      className="h-10 w-10 flex items-center justify-center bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      title="Subscribe"
                    >
                      <Rss size={20} />
                    </button>
                  )}
                  {role !== 'none' ? (
                    <button
                      onClick={onLogout}
                      className="h-10 w-10 flex items-center justify-center bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={onOpenAuth}
                      className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Log In"
                    >
                      <Lock size={20} />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
