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
    <header className="mb-8 border-b border-gray-300 dark:border-gray-700 pb-4">
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start">
        
        {/* LEFT COLUMN: Title & Last Updated */}
        <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-4xl font-extrabold flex items-center text-center sm:text-left text-theme-text">
            {HeaderIcon && (
              <HeaderIcon size={36} className="mr-3 text-theme-accent hidden sm:block" />
            )}
            <span>{renderTitle()}</span>
          </h1>

          {routeView !== 'guide' && (
            <p className="text-sm text-theme-text-secondary mt-2 sm:mt-3 flex items-center justify-center sm:justify-start">
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
                className="h-10 px-4 flex items-center justify-center bg-theme-item text-theme-text rounded-lg hover:bg-theme-item-hover transition-colors font-bold text-sm"
              >
                <ChevronLeft size={16} className="mr-1" /> Back to Calendar
              </button>
              <button
                onClick={onCycleTheme}
                className="h-10 w-10 flex items-center justify-center bg-theme-item text-theme-text rounded-lg hover:bg-theme-item-hover transition-colors"
              >
                {themeMode === 'dark' ? <Moon size={20} className="text-blue-400" /> : themeMode === 'custom' ? <Palette size={20} className="text-pink-500" /> : <Sun size={20} className="text-yellow-500" />}
              </button>
            </div>
          ) : (
            <>
              {/* LINE 1 CONTROLS */}
              <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 sm:gap-4">
                <div className="flex items-center space-x-2 bg-theme-item text-theme-text p-2 rounded-lg">
                  <button onClick={onYearPrev} className="p-1 hover:bg-theme-item-hover rounded text-theme-accent" title="Previous Year">
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
                  <button onClick={onYearNext} className="p-1 hover:bg-theme-item-hover rounded text-theme-accent" title="Next Year">
                    <ChevronRight size={20} />
                  </button>
                </div>

                {(!routeView || routeView === 'year' || routeView === 'planner' || routeView === 'list') && (
                  <div className="flex bg-theme-item p-1 rounded-lg items-center shadow-inner">
                    <button
                      onClick={() => onViewToggle('year')}
                      className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${(!routeView || routeView === 'year') ? 'bg-theme-panel text-theme-accent shadow-sm' : 'text-theme-text-secondary hover:text-theme-text'}`}
                    >
                      <span className="hidden sm:inline">Year</span>
                      <span className="sm:hidden">Yr</span>
                    </button>
                    <button
                      onClick={() => onViewToggle('planner')}
                      className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${routeView === 'planner' ? 'bg-theme-panel text-theme-accent shadow-sm' : 'text-theme-text-secondary hover:text-theme-text'}`}
                    >
                      <span className="hidden sm:inline">Planner</span>
                      <span className="sm:hidden">Plan</span>
                    </button>
                    <button
                      onClick={() => onViewToggle('list')}
                      className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${routeView === 'list' ? 'bg-theme-panel text-theme-accent shadow-sm' : 'text-theme-text-secondary hover:text-theme-text'}`}
                    >
                      <span className="hidden sm:inline">List</span>
                      <span className="sm:hidden">List</span>
                    </button>
                  </div>
                )}

                {hasFilters && (
                  <button
                    onClick={onClearFilters} 
                    className="px-3 h-10 bg-theme-item hover:bg-theme-item-hover text-theme-accent rounded-lg text-sm font-bold transition-colors flex items-center justify-center"
                  >
                    <span className="hidden sm:inline">Clear Filters</span>
                    <span className="sm:hidden">Clear</span>
                  </button>
                )}

                {/* ICONS ON LINE 1 (Desktop Only) */}
                <div className="hidden sm:flex items-center gap-3">
                  <button
                    onClick={onOpenHelp}
                    className="h-10 w-10 flex items-center justify-center bg-theme-item text-theme-text rounded-lg hover:bg-theme-item-hover transition-colors"
                    title="Help & Shortcuts"
                  >
                    <HelpCircle size={20} />
                  </button>

                  {role === 'admin' && (
                    <button
                      onClick={onGoToGuide}
                      className="h-10 w-10 flex items-center justify-center bg-theme-item text-theme-text rounded-lg hover:bg-theme-item-hover transition-colors"
                      title="User Guide"
                    >
                      <BookOpen size={20} />
                    </button>
                  )}

                  <button
                    onClick={onCycleTheme}
                    className="h-10 w-10 flex items-center justify-center bg-theme-item text-theme-text rounded-lg hover:bg-theme-item-hover transition-colors"
                  >
                    {themeMode === 'dark' ? <Moon size={20} className="text-blue-400" /> : themeMode === 'custom' ? <Palette size={20} className="text-pink-500" /> : <Sun size={20} className="text-yellow-500" />}
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
                      className={`h-10 w-10 flex items-center justify-center rounded-lg transition-colors ${
                        themeMode === 'custom'
                          ? 'bg-theme-item text-theme-text hover:bg-theme-item-hover'
                          : 'shadow-sm border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
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
                    className="h-10 w-10 flex items-center justify-center bg-theme-item text-theme-text rounded-lg hover:bg-theme-item-hover transition-colors"
                    title="Help & Shortcuts"
                  >
                    <HelpCircle size={20} />
                  </button>

                  {role === 'admin' && (
                    <button
                      onClick={onGoToGuide}
                      className="h-10 w-10 flex items-center justify-center bg-theme-item text-theme-text rounded-lg hover:bg-theme-item-hover transition-colors"
                      title="User Guide"
                    >
                      <BookOpen size={20} />
                    </button>
                  )}

                  <button
                    onClick={onCycleTheme}
                    className="h-10 w-10 flex items-center justify-center bg-theme-item text-theme-text rounded-lg hover:bg-theme-item-hover transition-colors"
                  >
                    {themeMode === 'dark' ? <Moon size={20} className="text-blue-400" /> : themeMode === 'custom' ? <Palette size={20} className="text-pink-500" /> : <Sun size={20} className="text-yellow-500" />}
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
                      className={`h-10 w-10 flex items-center justify-center rounded-lg transition-colors ${
                        themeMode === 'custom'
                          ? 'bg-theme-item text-theme-text hover:bg-theme-item-hover'
                          : 'shadow-sm border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
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
