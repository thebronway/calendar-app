import React, { useState, useEffect } from 'react';
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

import { sanitizeHtml } from './utils/helpers';
import { MONTHS } from './utils/constants';
import type { Role, CalendarDataset, KeyItem } from './types';

const SESSION_TOKEN_KEY = 'calendar_admin_token';

export default function App() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
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
    onYearChange: setYear,
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

  const { stats, iconCounts, locationCounts } = useCalendarStats({ calendarData, year, keyItems });

  const {
    highlightFilters,
    handleLocationFilterToggle,
    handleIconFilterToggle,
    clearFilters,
    shouldHighlightCell,
  } = useHighlightFilters();

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
    document.title = title;
  }, [year, config]);

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
        if (e.key === 'ArrowLeft') setYear((y) => y - 1);
        if (e.key === 'ArrowRight') setYear((y) => y + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, showSettingsModal, showKeyModal, showAuthModal, showHelpModal]);

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
          onYearPrev={() => setYear((y) => y - 1)}
          onYearNext={() => setYear((y) => y + 1)}
          onToggleDarkMode={toggleDarkMode}
          onToggleBulkEdit={() => { setIsBulkEditMode((b) => !b); setSelectedCells([]); }}
          onOpenKeyModal={() => setShowKeyModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onLogout={handleLogout}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenHelp={() => setShowHelpModal(true)}
        />

        <KeySection
          keyItems={keyItems}
          stats={stats}
          iconCounts={iconCounts}
          highlightFilters={highlightFilters}
          onIconFilterToggle={handleIconFilterToggle}
          onClearFilters={clearFilters}
        />

        <StatsSection
          year={year}
          stats={stats}
          locationCounts={locationCounts}
          highlightFilters={highlightFilters}
          onLocationFilterToggle={handleLocationFilterToggle}
        />

        {isBulkEditMode && (
          <BulkEditBar
            selectedCells={selectedCells}
            onEditSelected={() => setActiveCell('bulk')}
            onClear={() => setSelectedCells([])}
          />
        )}

        <div className="flex flex-wrap -m-2 relative z-0">
          {MONTHS.map((_, i) => (
            <MonthView
              key={i}
              monthIndex={i}
              year={year}
              calendarData={calendarData}
              keyItems={keyItems}
              isExpanded={expandedMonths[i]}
              onToggleMonth={(idx: number) =>
                setExpandedMonths((prev) => ({ ...prev, [idx]: !prev[idx] }))
              }
              shouldHighlightCell={shouldHighlightCell}
              isBulkEditMode={isBulkEditMode}
              selectedCells={selectedCells}
              onCellClick={handleCellClick}
            />
          ))}
        </div>
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
        onYearChange={setYear}
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
