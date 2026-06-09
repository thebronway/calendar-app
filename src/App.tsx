import React, { useState, useEffect, useCallback } from 'react';
import { Loader } from 'lucide-react';

// Layout
import MainLayout from './components/layout/MainLayout';
import AppHeader from './components/layout/AppHeader';

// Sections
import KeySection from './components/key/KeySection';
import StatsSection from './components/stats/StatsSection';
import BulkEditBar from './components/calendar/BulkEditBar';
// Modals & Components
import MonthView from './components/MonthView';
import SingleMonthView from './components/SingleMonthView';
import ListView from './components/ListView';
import PlannerView from './components/PlannerView';
import CellEditor from './components/CellEditor';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import KeyConfigModal from './components/KeyConfigModal';
import FeedManagerModal from './components/FeedManagerModal';
import UserGuide from './components/UserGuide';

// Hooks
import { useCalendarData } from './hooks/useCalendarData';
import { useCalendarStats } from './hooks/useCalendarStats';
import { useConfig } from './hooks/useConfig';
import { useDarkMode } from './hooks/useDarkMode';
import { useHighlightFilters } from './hooks/useHighlightFilters';
import { useCustomRoute } from './hooks/useCustomRoute';
import { useFilteredData } from './hooks/useFilteredData';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useModals } from './hooks/useModals';
import { useBulkEdit } from './hooks/useBulkEdit';
import { useFeeds } from './hooks/useFeeds';

import { slugify, getAdjacentDateKey } from './utils/helpers';
import { MONTHS } from './utils/constants';
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

  const { showAuthModal, setShowAuthModal, showSettingsModal, setShowSettingsModal, showKeyModal, setShowKeyModal, showFeedsModal, setShowFeedsModal, activeCell, setActiveCell } = useModals();
  const { isBulkEditMode, selectedCells, toggleBulkEdit, clearBulkEdit, clearSelection, toggleCellSelection } = useBulkEdit();
  const { feeds, isFeedsLoading, fetchFeeds, saveFeed, deleteFeed } = useFeeds({ adminToken, role });
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

  const { filteredKeyItems, filteredCalendarData } = useFilteredData({
    calendarData,
    keyItems,
    categoryFilters: route.categoryFilters,
    activityFilters: route.activityFilters,
  });

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
  useEffect(() => { fetchFeeds(); }, [fetchFeeds]);

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

  useKeyboardShortcuts({
    activeCell,
    showSettingsModal,
    showKeyModal,
    showAuthModal,
    setActiveCell,
    setShowSettingsModal,
    setShowKeyModal,
    setShowAuthModal,
    handlePrevNav,
    handleNextNav,
  });

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
    clearBulkEdit();
  };

  const handleCellClick = (key: string) => {
    if (isBulkEditMode) {
      toggleCellSelection(key);
    } else {
      setActiveCell(key);
    }
  };

  const handleDayUpdate = (updatedDayData: any, nextAction?: 'prev' | 'next' | 'close') => {
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
      clearBulkEdit();
    } else {
      if (!activeCell) return;
      updatedDayData.year = parseInt(activeCell.split('-')[0], 10);
      newDayData[activeCell] = updatedDayData;
    }

    setCalendarData(newDayData);
    setLastUpdatedText(ts);
    saveData({ dayData: newDayData, keyItems, lastUpdatedText: ts });

    if (nextAction === 'prev' || nextAction === 'next') {
      setActiveCell(getAdjacentDateKey(activeCell!, nextAction));
    } else if (nextAction === 'close') {
      setActiveCell(null);
    }
  };

  const handleNavigateDay = (direction: 'prev' | 'next') => {
    if (!activeCell || activeCell === 'bulk') return;
    setActiveCell(getAdjacentDateKey(activeCell, direction));
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
    <MainLayout
      bannerHtml={config.bannerHtml}
      header={
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
          hasPublicFeeds={feeds.some(f => f.isPublic)}
          onClearFilters={handleClearFilters}
          onViewToggle={(view) => navigate(`/${year}/${view}${window.location.search}`)}
          onYearPrev={handlePrevNav}
          onYearNext={handleNextNav}
          onToggleDarkMode={toggleDarkMode}
          onToggleBulkEdit={toggleBulkEdit}
          onOpenKeyModal={() => setShowKeyModal(true)}
          onOpenFeeds={() => setShowFeedsModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onLogout={handleLogout}
          onOpenAuth={() => setShowAuthModal(true)}
          onGoToGuide={() => navigate('/guide')}
        />
      }
      modals={
        <>
          <CellEditor
            isOpen={!!activeCell}
            onClose={() => setActiveCell(null)}
            onNavigate={handleNavigateDay}
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
          <FeedManagerModal
            isOpen={showFeedsModal}
            onClose={() => setShowFeedsModal(false)}
            feeds={feeds}
            isFeedsLoading={isFeedsLoading}
            keyItems={keyItems}
            calendarData={calendarData}
            year={year}
            onSaveFeed={saveFeed}
            onDeleteFeed={deleteFeed}
            role={role}
          />
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onAuthenticate={handleAuthenticate}
          />
        </>
      }
    >
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
            onClear={clearSelection}
          />
        )}

        {route.view === 'guide' ? (
          <UserGuide />
        ) : route.view === 'list' ? (
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
          <SingleMonthView
            year={year}
            routeView={route.view}
            calendarData={filteredCalendarData}
            keyItems={filteredKeyItems}
            expandedMonths={expandedMonths}
            setExpandedMonths={setExpandedMonths}
            shouldHighlightCell={shouldHighlightCell}
            isBulkEditMode={isBulkEditMode}
            selectedCells={selectedCells}
            onCellClick={handleCellClick}
          />
        )}
    </MainLayout>
  );
}