import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader } from 'lucide-react';

// Layout
import AppHeader from './components/layout/AppHeader';
import Footer from './components/Footer';

// Sections
import KeySection from './components/key/KeySection';
import StatsSection from './components/stats/StatsSection';
import BulkEditBar from './components/calendar/BulkEditBar';
// Modals & Components
import MonthView from './components/MonthView';
import ListView from './components/ListView';
import PlannerView from './components/PlannerView';
import MonthLegend from './components/MonthLegend';
import CellEditor from './components/CellEditor';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import KeyConfigModal from './components/KeyConfigModal';
import HelpModal from './components/HelpModal';

// Hooks
import { useCalendarData } from './hooks/useCalendarData';
import { useCalendarStats } from './hooks/useCalendarStats';
import { useConfig } from './hooks/useConfig';
import { useDarkMode } from './hooks/useDarkMode';
import { useHighlightFilters } from './hooks/useHighlightFilters';
import { useCustomRoute } from './hooks/useCustomRoute';

import { sanitizeHtml, slugify } from './utils/helpers';
import { MONTHS, ICON_MAP, CATEGORY_COLORS } from './utils/constants';
import type { Role, CalendarDataset, KeyItem } from './types';

const SESSION_TOKEN_KEY = 'calendar_admin_token';

export default function App() {
  const { route, navigate } = useCustomRoute();
  const year = route.year;

  const handleYearChange = useCallback((newYear: number) => {
    const currentSearch = window.location.search;
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const currentView = pathParts.length > 1 ? pathParts[1] : '';
    navigate(`/${newYear}/${currentView}${currentSearch}`);
  }, [navigate]);

  const [role, setRole] = useState<Role>('view');
  const [adminToken, setAdminToken] = useState<string | null>(() =>
    sessionStorage.getItem(SESSION_TOKEN_KEY)
  );

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Record<number, boolean>>({});

  // --- Hooks ---
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const { config, setConfig, fetchConfig, saveConfig } = useConfig({
    adminToken,
    role,
  });

  const {
    calendarData,
    setCalendarData,
    keyItems,
    setKeyItems,
    lastUpdatedText,
    setLastUpdatedText,
    isSaving,
    isDataLoading,
    fetchData,
    saveData,
    connectWebSocket,
    disconnectWebSocket,
  } = useCalendarData({ year, role, adminToken, onConfigUpdate: setConfig });

  const filteredKeyItems = useMemo(() => {
    return keyItems.filter((item) => {
      const slug = slugify(item.label);
      if (item.isColorKey) {
        return route.categoryFilters.length === 0 || route.categoryFilters.includes(slug);
      } else {
        return route.activityFilters.length === 0 || route.activityFilters.includes(slug);
      }
    });
  }, [keyItems, route.categoryFilters, route.activityFilters]);

  const filteredCalendarData = useMemo(() => {
    if (!calendarData) return null;
    // If no filters active, return original data
    if (route.activityFilters.length === 0 && route.categoryFilters.length === 0) return calendarData;

    const filtered: CalendarDataset = {};
    Object.entries(calendarData).forEach(([key, day]) => {
      const newDay = { ...day, icons: [...(day.icons || [])] };
      
      let hasCatMatch = false;
      let hasActMatch = false;
      let keepDay = false;

      // Check category match
      if (route.categoryFilters.length > 0) {
        const cat = keyItems.find((k) => k.id === newDay.colorId);
        if (cat && route.categoryFilters.includes(slugify(cat.label))) {
          hasCatMatch = true;
        }
      }

      // Check activity match
      const matchingIcons = newDay.icons.filter((iconEntry) => {
        const iconValue = iconEntry.value || iconEntry.icon;
        const iconDef = keyItems.find(
          (k) => k.icon === iconValue && k.iconColor === iconEntry.color && !k.isColorKey
        );
        return iconDef && route.activityFilters.includes(slugify(iconDef.label));
      });

      if (route.activityFilters.length > 0 && matchingIcons.length > 0) {
        hasActMatch = true;
      }

      // Determine if we keep the day based on an OR logic
      if (route.categoryFilters.length > 0 && route.activityFilters.length > 0) {
        keepDay = hasCatMatch || hasActMatch;
      } else if (route.categoryFilters.length > 0) {
        keepDay = hasCatMatch;
      } else if (route.activityFilters.length > 0) {
        keepDay = hasActMatch;
      }

      if (keepDay) {
        // If it didn't match the category filter, strip the color so it doesn't look like a match
        if (route.categoryFilters.length > 0 && !hasCatMatch) {
          newDay.colorId = 'none';
        }
        // If it didn't match the category filter, strip non-matching activities
        if (route.activityFilters.length > 0 && !hasCatMatch) {
          newDay.icons = matchingIcons;
        }
      } else {
        // If the day doesn't match any of the hard filters, clear its visual data
        newDay.colorId = 'none';
        newDay.icons = [];
        newDay.locations = '';
        newDay.details = '';
      }

      filtered[key] = newDay;
    });
    return filtered;
  }, [calendarData, keyItems, route.activityFilters, route.categoryFilters]);

  const { stats, iconCounts, locationCounts } = useCalendarStats({ 
    calendarData: filteredCalendarData, 
    year, 
    keyItems: filteredKeyItems 
  });

  // Declare highlightFilters before using them in the callbacks
  const {
    highlightFilters,
    handleLocationFilterToggle,
    handleIconFilterToggle,
    handleCategoryFilterToggle,
    clearFilters,
    shouldHighlightCell,
  } = useHighlightFilters();

  const hasActiveFilters = route.activityFilters.length > 0 || route.categoryFilters.length > 0;
  const isCustomView = route.view !== 'year' || hasActiveFilters;

  const handleClearFilters = useCallback(() => {
    navigate(`/${year}/year`);
  }, [navigate, year]);

  const handlePrevNav = useCallback(() => {
    if (route.view === 'year' || route.view === 'list' || route.view === 'planner') {
      handleYearChange(year - 1);
    } else {
      const monthIdx = MONTHS.findIndex((m) => slugify(m) === route.view);
      if (monthIdx !== -1) {
        if (monthIdx === 0) {
          navigate(`/${year - 1}/december${window.location.search}`);
        } else {
          navigate(`/${year}/${slugify(MONTHS[monthIdx - 1])}${window.location.search}`);
        }
      } else {
        handleYearChange(year - 1);
      }
    }
  }, [route.view, year, handleYearChange, navigate]);

  const handleNextNav = useCallback(() => {
    if (route.view === 'year' || route.view === 'list' || route.view === 'planner') {
      handleYearChange(year + 1);
    } else {
      const monthIdx = MONTHS.findIndex((m) => slugify(m) === route.view);
      if (monthIdx !== -1) {
        if (monthIdx === 11) {
          navigate(`/${year + 1}/january${window.location.search}`);
        } else {
          navigate(`/${year}/${slugify(MONTHS[monthIdx + 1])}${window.location.search}`);
        }
      } else {
        handleYearChange(year + 1);
      }
    }
  }, [route.view, year, handleYearChange, navigate]);

  const handleViewAsList = useCallback(() => {
    const activitySlugs = highlightFilters.icons.map(f => {
      const k = keyItems.find(item => item.icon === f.icon && item.iconColor === f.iconColor);
      return k ? slugify(k.label) : null;
    }).filter(Boolean);

    const categorySlugs = highlightFilters.categories?.map(id => {
      const k = keyItems.find(item => item.id === id);
      return k ? slugify(k.label) : null;
    }).filter(Boolean) || [];
    
    clearFilters(); // Clear the soft highlight filters
    
    const params = new URLSearchParams();
    if (activitySlugs.length > 0) params.set('a', activitySlugs.join(','));
    if (categorySlugs.length > 0) params.set('c', categorySlugs.join(','));
    const qs = params.toString();
    
    navigate(`/${year}/list${qs ? `?${qs}` : ''}`);
  }, [highlightFilters, keyItems, navigate, year, clearFilters]);

  const handleViewAsPlanner = useCallback(() => {
    const activitySlugs = highlightFilters.icons.map(f => {
      const k = keyItems.find(item => item.icon === f.icon && item.iconColor === f.iconColor);
      return k ? slugify(k.label) : null;
    }).filter(Boolean);

    const categorySlugs = highlightFilters.categories?.map(id => {
      const k = keyItems.find(item => item.id === id);
      return k ? slugify(k.label) : null;
    }).filter(Boolean) || [];
    
    clearFilters(); // Clear the soft highlight filters
    
    const params = new URLSearchParams();
    if (activitySlugs.length > 0) params.set('a', activitySlugs.join(','));
    if (categorySlugs.length > 0) params.set('c', categorySlugs.join(','));
    const qs = params.toString();
    
    navigate(`/${year}/planner${qs ? `?${qs}` : ''}`);
  }, [highlightFilters, keyItems, navigate, year, clearFilters]);

  const handleMonthNavigate = useCallback((month: string) => {
    const currentSearch = window.location.search;
    navigate(`/${year}/${slugify(month)}${currentSearch}`);
  }, [navigate, year]);

  // --- Restore admin session on mount ---
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (saved) {
      setAdminToken(saved);
      setRole('admin');
    }
  }, []);

  // --- Effects ---
  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  useEffect(() => {
    connectWebSocket();
    return disconnectWebSocket;
  }, [connectWebSocket, disconnectWebSocket]);

  useEffect(() => { fetchData(year); }, [year, fetchData]);

  useEffect(() => {
    let now: Date;
    try {
      now = new Date(new Date().toLocaleString('en-US', { timeZone: config.timezone }));
    } catch {
      now = new Date();
    }
    const idx = now.getMonth();
    setExpandedMonths({ [idx]: true });
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById(`month-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [config.timezone]);

  useEffect(() => {
    const n = config.ownerName || 'Name';
    const style = config.browserTitleStyle || 'simple';
    let title = `${year} Calendar`;
    if (style === 'possessive') title = `${n}'s Calendar`;
    if (style === 'question') title = `Where is ${n} in ${year}?`;

    if (hasActiveFilters) {
      const activeNames = keyItems
        .filter((k) => route.activityFilters.includes(slugify(k.label)) || route.categoryFilters.includes(slugify(k.label)))
        .map((k) => k.label)
        .join(', ');
      if (activeNames) {
        title = `${title} - ${activeNames}`;
      }
    }

    document.title = title;
  }, [year, config, hasActiveFilters, route.activityFilters, route.categoryFilters, keyItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      // ESC closes any open modal
      if (e.key === 'Escape') {
        if (activeCell) { setActiveCell(null); return; }
        if (showSettingsModal) { setShowSettingsModal(false); return; }
        if (showKeyModal) { setShowKeyModal(false); return; }
        if (showAuthModal) { setShowAuthModal(false); return; }
        if (showHelpModal) { setShowHelpModal(false); return; }
      }

      // Arrow keys handle navigation only when no modal is open
      const anyModalOpen = activeCell || showSettingsModal || showKeyModal || showAuthModal || showHelpModal;
      if (!anyModalOpen) {
        if (e.key === 'ArrowLeft') handlePrevNav();
        if (e.key === 'ArrowRight') handleNextNav();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, showSettingsModal, showKeyModal, showAuthModal, showHelpModal, handlePrevNav, handleNextNav]);

  // --- Handlers ---
  const handleAuthenticate = (r: Role, t: string) => {
    setRole(r);
    setAdminToken(t);
    sessionStorage.setItem(SESSION_TOKEN_KEY, t);
  };

  const handleLogout = () => {
    setRole('view');
    setAdminToken(null);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    setIsBulkEditMode(false);
    setSelectedCells([]);
  };

  const handleCellClick = (key: string) => {
    if (isBulkEditMode) {
      setSelectedCells((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    } else {
      setActiveCell(key);
    }
  };

  const handleDayUpdate = (updatedDayData: any) => {
    const ts = new Date().toLocaleDateString();
    const newDayData: CalendarDataset = { ...(calendarData ?? {}) };

    if (activeCell === 'bulk') {
      selectedCells.forEach((dayKey) => {
        const [y, m, d] = dayKey.split('-');
        newDayData[dayKey] = {
          day: parseInt(d, 10),
          month: MONTHS[parseInt(m, 10) - 1],
          year: parseInt(y, 10),
          colorId: updatedDayData.colorId,
          icons: updatedDayData.icons,
          locations: updatedDayData.locations,
          details: updatedDayData.details,
        };
      });
      setIsBulkEditMode(false);
      setSelectedCells([]);
    } else {
      if (!activeCell) return;
      updatedDayData.year = parseInt(activeCell.split('-')[0], 10);
      newDayData[activeCell] = updatedDayData;
    }

    setCalendarData(newDayData);
    setLastUpdatedText(ts);
    saveData({ dayData: newDayData, keyItems, lastUpdatedText: ts });
  };

  const handleKeyUpdate = (newKeyItems: KeyItem[]) => {
    setKeyItems(newKeyItems);
    const ts = new Date().toLocaleDateString();
    setLastUpdatedText(ts);
    saveData({ dayData: calendarData ?? {}, keyItems: newKeyItems, lastUpdatedText: ts });
  };

  if (isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200 dark:bg-gray-900">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      {config.bannerHtml && (
        <div
          className="sticky top-0 z-[70] bg-yellow-50 border-b border-yellow-300 text-yellow-800 py-2 px-4 text-center text-sm font-medium shadow-sm"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.bannerHtml) }}
        />
      )}

      <div className="max-w-screen-2xl mx-auto p-4 sm:p-6">
        <AppHeader
          year={year}
          config={config}
          role={role}
          isDarkMode={isDarkMode}
          isSaving={isSaving}
          isBulkEditMode={isBulkEditMode}
          lastUpdatedText={lastUpdatedText}
          hasFilters={isCustomView}
          routeView={route.view}
          onClearFilters={handleClearFilters}
          onViewToggle={(view) => navigate(`/${year}/${view}${window.location.search}`)}
          onYearPrev={handlePrevNav}
          onYearNext={handleNextNav}
          onToggleDarkMode={toggleDarkMode}
          onToggleBulkEdit={() => { setIsBulkEditMode((b) => !b); setSelectedCells([]); }}
          onOpenKeyModal={() => setShowKeyModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onLogout={handleLogout}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenHelp={() => setShowHelpModal(true)}
        />

        {route.view === 'year' && (
          <KeySection
            keyItems={filteredKeyItems}
            stats={stats}
            iconCounts={iconCounts}
            highlightFilters={highlightFilters}
            onIconFilterToggle={handleIconFilterToggle}
            onCategoryFilterToggle={handleCategoryFilterToggle}
            onClearFilters={clearFilters}
            onViewAsList={handleViewAsList}
            onViewAsPlanner={handleViewAsPlanner}
          />
        )}

        {route.view === 'year' && !hasActiveFilters && (
          <StatsSection
            year={year}
            stats={stats}
            locationCounts={locationCounts}
            highlightFilters={highlightFilters}
            onLocationFilterToggle={handleLocationFilterToggle}
          />
        )}

        {isBulkEditMode && (
          <BulkEditBar
            selectedCells={selectedCells}
            onEditSelected={() => setActiveCell('bulk')}
            onClear={() => setSelectedCells([])}
          />
        )}

        {route.view === 'list' ? (
          <ListView 
            calendarData={filteredCalendarData} 
            keyItems={filteredKeyItems} 
            onCellClick={handleCellClick}
          />
        ) : route.view === 'planner' ? (
          <PlannerView
            year={year}
            calendarData={filteredCalendarData}
            keyItems={filteredKeyItems}
            shouldHighlightCell={shouldHighlightCell}
            isBulkEditMode={isBulkEditMode}
            selectedCells={selectedCells}
            onCellClick={handleCellClick}
          />
        ) : route.view === 'year' ? (
          <div className="flex flex-wrap -m-2 relative z-0">
            {MONTHS.map((_, i) => {
              if (hasActiveFilters) {
                const hasEventsInMonth = filteredCalendarData && Object.values(filteredCalendarData).some(
                  (day) => day.month === MONTHS[i] && (day.colorId !== 'none' || (day.icons && day.icons.length > 0))
                );
                if (!hasEventsInMonth) return null;
              }

              return (
                <MonthView
                  key={i}
                  monthIndex={i}
                  year={year}
                  calendarData={filteredCalendarData}
                  keyItems={filteredKeyItems}
                  isExpanded={expandedMonths[i]}
                  onToggleMonth={(idx: number) =>
                    setExpandedMonths((prev) => ({ ...prev, [idx]: !prev[idx] }))
                  }
                  shouldHighlightCell={shouldHighlightCell}
                  isBulkEditMode={isBulkEditMode}
                  selectedCells={selectedCells}
                  onCellClick={handleCellClick}
                  onMonthClick={() => handleMonthNavigate(MONTHS[i])}
                />
              );
            })}
          </div>
        ) : (
          <div className="mt-4">
            {(() => {
              const mIndex = MONTHS.findIndex((m) => slugify(m) === route.view);
              if (mIndex === -1) return null;
              
              const monthName = MONTHS[mIndex];
              const activeDays = filteredCalendarData 
                ? Object.entries(filteredCalendarData)
                    .filter(([_, day]) => day.month === monthName && (day.colorId !== 'none' || (day.icons && day.icons.length > 0)))
                    .map(([key, day]) => ({ key, ...day }))
                    .sort((a, b) => a.key.localeCompare(b.key))
                : [];

              const daysInMonth = new Date(Date.UTC(year, mIndex + 1, 0)).getUTCDate();

              return (
                <div className="rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden mb-8">
                  
                  {/* FULL WIDTH HEADER */}
                  <div className="bg-gray-100 dark:bg-gray-900 px-6 py-3 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{monthName} {year}</h3>
                    <span className="text-sm font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full shadow-sm">
                      {activeDays.length} / {daysInMonth} days
                    </span>
                  </div>

                  {/* 3-COLUMN CONTENT */}
                  <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
                    <div className="lg:col-span-1">
                      <MonthView
                        monthIndex={mIndex}
                        year={year}
                        calendarData={filteredCalendarData}
                        keyItems={filteredKeyItems}
                        isExpanded={expandedMonths[mIndex] ?? true}
                        onToggleMonth={(idx: number) =>
                          setExpandedMonths((prev) => ({ ...prev, [idx]: !prev[idx] }))
                        }
                        shouldHighlightCell={shouldHighlightCell}
                        isBulkEditMode={isBulkEditMode}
                        selectedCells={selectedCells}
                        onCellClick={handleCellClick}
                        className="w-full"
                        isPlanner={true}
                      />
                    </div>
                    <div className="lg:col-span-2 columns-1 md:columns-2 gap-6">
                      {activeDays.length > 0 ? (
                        activeDays.map((day) => {
                          const category = keyItems.find((k) => k.id === day.colorId);
                          const colorDef = category ? CATEGORY_COLORS.find((c) => c.id === category.colorCode) : null;
                          const catClass = colorDef ? `${colorDef.bg} text-white dark:text-gray-900` : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';

                          const [y, m, d] = day.key.split('-');
                          const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
                          const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

                          return (
                            <div 
                              key={day.key}
                              onClick={() => handleCellClick(day.key)}
                              className="break-inside-avoid bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <div className="flex px-4 py-3 gap-4">
                                <div className="w-14 flex-shrink-0 flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 h-fit">
                                  <span className="text-[10px] font-bold text-gray-500 uppercase">{dayOfWeek}</span>
                                  <span className="text-lg font-extrabold text-gray-900 dark:text-gray-100 leading-none mt-0.5">{day.day}</span>
                                </div>
                                
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {category && (
                                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${catClass}`}>
                                        {category.label}
                                      </span>
                                    )}
                                    {day.locations && (
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                                        📍 {day.locations}
                                      </span>
                                    )}
                                  </div>
                                  {day.icons && day.icons.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                      {day.icons.map((icon, i) => {
                                        const IC = ICON_MAP[icon.value || icon.icon || ''];
                                        const keyDef = keyItems.find(k => k.icon === (icon.value || icon.icon) && k.iconColor === icon.color);
                                        const label = icon.displayName || (keyDef ? keyDef.label : (icon.value || icon.icon));
                                        return IC ? (
                                          <div key={i} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-600 px-2 py-1 rounded-md shadow-sm">
                                            <IC size={14} className={icon.color} />
                                            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{label}</span>
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400 italic bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 text-center break-inside-avoid">
                          No events this month.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <CellEditor
        isOpen={!!activeCell}
        onClose={() => setActiveCell(null)}
        dayData={
          activeCell === 'bulk'
            ? ({ month: 'Multiple', day: 'Days', colorId: 'none', icons: [], locations: '', details: '' } as any)
            : activeCell && calendarData ? calendarData[activeCell] : null
        }
        onSave={handleDayUpdate}
        isAdmin={role === 'admin'}
        keyItems={keyItems}
        isBulkEdit={activeCell === 'bulk'}
        bulkCount={selectedCells.length}
        hasFilters={hasActiveFilters}
      />
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        config={config}
        onConfigSave={saveConfig}
      />
      <KeyConfigModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        keyItems={keyItems}
        onKeyItemsSave={handleKeyUpdate}
        year={year}
        onYearChange={handleYearChange}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticate={handleAuthenticate}
      />
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      <Footer />
    </div>
  );
}
