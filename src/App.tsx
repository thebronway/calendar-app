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
import { MONTHS, ICON_MAP } from './utils/constants';
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
      let keepDay = true;

      // Check category match
      if (route.categoryFilters.length > 0) {
        const cat = keyItems.find((k) => k.id === newDay.colorId);
        if (!cat || !route.categoryFilters.includes(slugify(cat.label))) {
          keepDay = false;
        }
      }

      // Check activity match
      if (route.activityFilters.length > 0) {
        const matchingIcons = newDay.icons.filter((iconEntry) => {
          const iconValue = iconEntry.value || iconEntry.icon;
          const iconDef = keyItems.find(
            (k) => k.icon === iconValue && k.iconColor === iconEntry.color && !k.isColorKey
          );
          return iconDef && route.activityFilters.includes(slugify(iconDef.label));
        });

        if (matchingIcons.length === 0) {
          keepDay = false; // Day doesn't have the requested activity
        } else {
          newDay.icons = matchingIcons; // Strip other non-matching icons from the cell
        }
      }

      // If the day doesn't match the hard filters, clear its visual data
      if (!keepDay) {
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
    clearFilters,
    shouldHighlightCell,
  } = useHighlightFilters();

  const hasActiveFilters = route.activityFilters.length > 0 || route.categoryFilters.length > 0;
  const isCustomView = route.view !== 'year' || hasActiveFilters;

  const handleClearFilters = useCallback(() => {
    navigate(`/${year}/year`);
  }, [navigate, year]);

  const handlePrevNav = useCallback(() => {
    if (route.view === 'year' || route.view === 'list') {
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
    if (route.view === 'year' || route.view === 'list') {
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
    const slugs = highlightFilters.icons.map(f => {
      const k = keyItems.find(item => item.icon === f.icon && item.iconColor === f.iconColor);
      return k ? slugify(k.label) : null;
    }).filter(Boolean);
    
    clearFilters(); // Clear the soft highlight filters
    
    if (slugs.length > 0) {
      navigate(`/${year}/list?a=${slugs.join(',')}`);
    } else {
      navigate(`/${year}/list`);
    }
  }, [highlightFilters.icons, keyItems, navigate, year, clearFilters]);

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

      // Arrow keys change year only when no modal is open
      const anyModalOpen = activeCell || showSettingsModal || showKeyModal || showAuthModal || showHelpModal;
      if (!anyModalOpen) {
        if (e.key === 'ArrowLeft') handleYearChange(year - 1);
        if (e.key === 'ArrowRight') handleYearChange(year + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [year, activeCell, showSettingsModal, showKeyModal, showAuthModal, showHelpModal, handleYearChange]);

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
            onClearFilters={clearFilters}
            onViewAsList={handleViewAsList}
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
          <div className="flex flex-col-reverse md:flex-row justify-center items-start gap-6 md:gap-10 w-full max-w-6xl mx-auto mt-4 px-2">
            {(() => {
              const mIndex = MONTHS.findIndex((m) => slugify(m) === route.view);
              if (mIndex === -1) return null;
              
              return (
                <>
                  <MonthLegend 
                    month={MONTHS[mIndex]} 
                    calendarData={filteredCalendarData} 
                    keyItems={keyItems} 
                  />
                  <div className="flex-1 w-full max-w-3xl relative z-0 [&>*]:!w-full [&>*]:!max-w-none [&>*]:!p-0">
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
                      onMonthClick={() => handleMonthNavigate(MONTHS[mIndex])}
                    />
                  </div>
                </>
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
