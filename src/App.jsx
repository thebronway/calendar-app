import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Footer from './components/Footer';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import KeyConfigModal from './components/KeyConfigModal';
import CellEditor from './components/CellEditor';
import MonthView from './components/MonthView';
import {
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Key,
  Loader,
  Lock,
  LogOut,
  Moon,
  Settings,
  Sun,
  X,
} from 'lucide-react';

import {
  CATEGORY_COLORS,
  ICON_MAP,
  MONTHS,
  DEFAULT_KEY_ITEMS
} from './utils/constants';
import { generateCalendarForYear } from './utils/helpers';

// --- MAIN APP COMPONENT ---
export default function App() {
  const [config, setConfig] = useState({
    timezone: 'UTC',
    headerStyle: 'simple',
    browserTitleStyle: 'simple',
    ownerName: '',
    headerIcon: 'CalendarDays',
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [role, setRole] = useState('view');
  const [adminToken, setAdminToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeCell, setActiveCell] = useState(null);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

  const [keyItems, setKeyItems] = useState(DEFAULT_KEY_ITEMS);
  const [lastUpdatedText, setLastUpdatedText] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [isKeyExpanded, setIsKeyExpanded] = useState(false);
  const [highlightFilters, setHighlightFilters] = useState({ locations: [], icons: [] });
  const [expandedMonths, setExpandedMonths] = useState({});
  const [apiError, setApiError] = useState(null);
  const wsRef = useRef(null);

  // Effect to Initialize Mobile View (Expand current month & Scroll)
  useEffect(() => {
    // Determine current month based on config timezone
    let now;
    try {
      now = new Date(new Date().toLocaleString('en-US', { timeZone: config.timezone }));
    } catch (e) {
      now = new Date();
    }
    const currentMonthIdx = now.getMonth();

    // 1. Expand only the current month initially
    setExpandedMonths({ [currentMonthIdx]: true });

    // 2. Auto-scroll to current month ONLY on mobile (width < 768px)
    if (window.innerWidth < 768) {
      setTimeout(() => {
        const element = document.getElementById(`month-${currentMonthIdx}`);
        if (element) {
          // Changed block to 'start' so it aligns to the top (respecting scroll-padding)
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [config.timezone]);

  const toggleMonth = (idx) => {
    setExpandedMonths((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Dark Mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      document.documentElement.classList.toggle('dark', newMode);
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeCell || showSettingsModal || showKeyModal || showAuthModal) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') setYear((y) => y - 1);
      if (e.key === 'ArrowRight') setYear((y) => y + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, showSettingsModal, showKeyModal, showAuthModal]);

  // Config Fetch
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const appConfig = await response.json();
        setConfig(appConfig);
        try {
          const now = new Date(
            new Date().toLocaleString('en-US', { timeZone: appConfig.timezone })
          );
          setYear(now.getFullYear());
        } catch (e) {
          console.warn('Invalid timezone');
        }
      } catch (e) {
        console.error('Config fetch error', e);
      }
    };
    fetchConfig();
  }, []);

  // WebSocket
  useEffect(() => {
    const getWebSocketURL = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}`;
    };
    const connectWebSocket = () => {
      wsRef.current = new WebSocket(getWebSocketURL());
      wsRef.current.onopen = () => setApiError(null);
      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'DATA_UPDATE') {
          const { year: uYear, data: uData } = message.payload;
          setYear((prev) => {
            if (uYear === prev) {
              setCalendarData(uData.dayData);
              setKeyItems(uData.keyItems || DEFAULT_KEY_ITEMS);
              setLastUpdatedText(uData.lastUpdatedText);
            }
            return prev;
          });
        } else if (message.type === 'CONFIG_UPDATE') {
          setConfig(message.payload);
        }
      };
      wsRef.current.onclose = () => {
        setTimeout(connectWebSocket, 3000);
      };
    };
    connectWebSocket();
    return () => wsRef.current?.close();
  }, []);

  // Data Fetch
  const fetchData = useCallback(async (currentYear) => {
    setIsDataLoading(true);
    try {
      const response = await fetch(`/api/data/${currentYear}`);
      const data = await response.json();
      if (!data.dayData) {
        const defaultData = {
          dayData: generateCalendarForYear(currentYear),
          keyItems: DEFAULT_KEY_ITEMS,
          lastUpdatedText: '',
        };
        setCalendarData(defaultData.dayData);
        setKeyItems(defaultData.keyItems);
        setLastUpdatedText('');
      } else {
        setCalendarData(data.dayData);
        setKeyItems(data.keyItems || DEFAULT_KEY_ITEMS);
        setLastUpdatedText(data.lastUpdatedText);
      }
    } catch (e) {
      setApiError('Failed to load data');
      setCalendarData({});
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(year);
  }, [year, fetchData]);

  // Page Title Update
  useEffect(() => {
    const y = year;
    const n = config.ownerName || 'Name';
    const style = config.browserTitleStyle || 'simple';
    let title = '';

    switch (style) {
      case 'possessive':
        title = `${n}'s Calendar`;
        break;
      case 'question':
        title = `Where is ${n} in ${y}?`;
        break;
      default:
        title = `${y} Calendar`;
    }
    document.title = title;
  }, [year, config]);

  const saveData = useCallback(
    async (dataToSave) => {
      if (role !== 'admin' || !adminToken) return;
      setIsSaving(true);
      try {
        await fetch(`/api/data/${year}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify(dataToSave),
        });
      } catch (e) {
        setApiError('Save failed');
      } finally {
        setTimeout(() => setIsSaving(false), 500);
      }
    },
    [role, adminToken, year]
  );

  const saveConfig = async (newConfig) => {
    if (role !== 'admin' || !adminToken) return;
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(newConfig),
      });
      if (res.ok) setConfig(newConfig);
    } catch (e) {
      setApiError('Config save failed');
    }
  };

  // Handlers
  const handleCellClick = (key) => {
    if (isBulkEditMode) {
      setSelectedCells(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    } else {
      setActiveCell(key);
    }
  };

  const handleDayUpdate = (updatedDayData) => {
    const ts = new Date().toLocaleDateString();
    let newDayData = { ...calendarData };

    if (activeCell === 'bulk') {
      selectedCells.forEach(dayKey => {
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
      const dayKey = activeCell;
      if (!dayKey) return;
      updatedDayData.year = parseInt(dayKey.split('-')[0], 10);
      newDayData[dayKey] = updatedDayData;
    }

    setCalendarData(newDayData);
    setLastUpdatedText(ts);
    saveData({ dayData: newDayData, keyItems, lastUpdatedText: ts });
  };

  const handleKeyUpdate = (newKeyItems) => {
    setKeyItems(newKeyItems);
    const ts = new Date().toLocaleDateString();
    setLastUpdatedText(ts);
    saveData({ dayData: calendarData, keyItems: newKeyItems, lastUpdatedText: ts });
  };

  const handleLocationFilterToggle = (loc) => {
    setHighlightFilters((prev) => ({
      ...prev,
      locations: prev.locations.includes(loc)
        ? prev.locations.filter((l) => l !== loc)
        : [...prev.locations, loc],
    }));
  };
  const handleIconFilterToggle = (item) => {
    const exists = highlightFilters.icons.find(
      (f) => f.icon === item.icon && f.iconColor === item.iconColor
    );
    setHighlightFilters((prev) => ({
      ...prev,
      icons: exists
        ? prev.icons.filter((i) => i !== exists)
        : [...prev.icons, { icon: item.icon, iconColor: item.iconColor }],
    }));
  };
  const shouldHighlightCell = (dayInfo) => {
    if (!highlightFilters.locations.length && !highlightFilters.icons.length) return false;
    const dayLocs = (dayInfo.locations || '')
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);
    const locMatch =
      !highlightFilters.locations.length ||
      highlightFilters.locations.every((f) => dayLocs.includes(f));
    const dayIcons = dayInfo.icons || dayInfo.content || [];
    const iconMatch =
      !highlightFilters.icons.length ||
      highlightFilters.icons.every((f) =>
        dayIcons.some((d) => (d.value || d.icon) === f.icon && d.color === f.iconColor)
      );
    return locMatch && iconMatch;
  };

  // Stats Logic
  const stats = useMemo(() => {
    if (!calendarData) return { totalDays: 0, categories: {}, totalHighlighted: 0 };
    const totalDays = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
    const catStats = {};
    let totalHighlighted = 0;
    keyItems.filter((k) => k.isColorKey).forEach((k) => (catStats[k.id] = 0));
    Object.values(calendarData).forEach((day) => {
      if (day.colorId && day.colorId !== 'none' && catStats[day.colorId] !== undefined) {
        catStats[day.colorId]++;
        totalHighlighted++;
      }
    });
    return { totalDays, categories: catStats, totalHighlighted };
  }, [calendarData, year, keyItems]);

  const iconCounts = useMemo(() => {
    if (!calendarData) return {};
    const counts = {};
    Object.values(calendarData).forEach((day) => {
      (day.icons || []).forEach((i) => {
        const key = `${i.value || i.icon}-${i.color}`;
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    return counts;
  }, [calendarData]);

  const locationCounts = useMemo(() => {
    if (!calendarData) return [];
    const counts = {};
    Object.values(calendarData).forEach((d) =>
      (d.locations || '')
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((l) => (counts[l] = (counts[l] || 0) + 1))
    );
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [calendarData]);

  if (isDataLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200 dark:bg-gray-900">
        <Loader className="animate-spin" size={48} />
      </div>
    );

  const renderHeaderTitle = () => {
    const y = year;
    const n = config.ownerName || 'Name';
    const style = config.headerStyle || 'simple';

    if (style === 'possessive') return <>{n}'s Calendar</>;
    if (style === 'question')
      return (
        <>
          Where is {n} in <span className="text-blue-600">{y}</span>?
        </>
      );
    return (
      <>
        <span className="text-blue-600 mr-2">{y}</span> Calendar
      </>
    );
  };

  // Split KeyItems for Key Display
  const keyCategories = keyItems.filter((k) => k.isColorKey);
  const keyActivities = keyItems.filter((k) => !k.isColorKey);

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      {config.bannerHtml && (
        <div
          className="sticky top-0 z-[70] bg-yellow-50 border-b border-yellow-300 text-yellow-800 py-2 px-4 text-center text-sm font-medium shadow-sm"
          dangerouslySetInnerHTML={{ __html: config.bannerHtml }}
        />
      )}

      <div className="max-w-screen-2xl mx-auto p-4 sm:p-6">
        <header className="mb-8 border-b dark:border-gray-700 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-2xl sm:text-4xl font-extrabold flex items-center">
              {React.createElement(ICON_MAP[config.headerIcon || 'CalendarDays'], {
                size: 36,
                className: 'mr-3 text-blue-600 hidden sm:block',
              })}
              <span>{renderHeaderTitle()}</span>
            </h1>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                <button
                  onClick={() => setYear((y) => y - 1)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-semibold">{year}</span>
                <button
                  onClick={() => setYear((y) => y + 1)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <button
                onClick={toggleDarkMode}
                className="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              {role === 'admin' ? (
                <>
                  <button
                    onClick={() => {
                      setIsBulkEditMode(!isBulkEditMode);
                      setSelectedCells([]);
                    }}
                    className={`h-10 w-10 sm:w-auto sm:px-4 flex items-center justify-center text-white rounded-lg transition-colors ${isBulkEditMode ? 'bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                    title="Bulk Edit"
                  >
                    <CalendarRange size={20} className="sm:mr-2" />
                    <span className="hidden sm:inline">{isBulkEditMode ? 'Cancel Bulk' : 'Bulk Edit'}</span>
                  </button>
                  <button
                    onClick={() => setShowKeyModal(true)}
                    className="h-10 w-10 sm:w-auto sm:px-4 flex items-center justify-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    title="Edit Key"
                  >
                    <Key size={20} className="sm:mr-2" />
                    <span className="hidden sm:inline">Key</span>
                  </button>
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="h-10 w-10 sm:w-auto sm:px-4 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Settings"
                  >
                    <Settings size={20} className="sm:mr-2" />
                    <span className="hidden sm:inline">Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setRole('view');
                      setAdminToken(null);
                    }}
                    className="h-10 w-10 sm:w-auto sm:px-4 flex items-center justify-center bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} className="sm:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
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

        <section className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
          <div
            className="flex justify-between items-center mb-4 cursor-pointer md:cursor-default"
            onClick={() => setIsKeyExpanded(!isKeyExpanded)}
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Key</h2>

            <div className="flex items-center gap-3">
              {(highlightFilters.locations.length > 0 || highlightFilters.icons.length > 0) && (
                <button
                  onClick={(_e) => {
                    _e.stopPropagation();
                    setHighlightFilters({ locations: [], icons: [] });
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center"
                >
                  <X size={16} className="mr-1" />
                  Clear Filters
                </button>
              )}

              <span className="md:hidden text-gray-800 dark:text-gray-100">
                {isKeyExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </span>
            </div>
          </div>

          {/* Collapsible Content Wrapper */}
          <div className={`${isKeyExpanded ? 'block' : 'hidden'} md:block space-y-6`}>
            {/* Categories Section */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Categories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {keyCategories.map((item) => {
                  const cDef = CATEGORY_COLORS.find((c) => c.id === item.colorCode);
                  let boxClass = 'bg-gray-100';
                  if (cDef) boxClass = `${cDef.bg} text-white dark:text-gray-100`;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center p-2 rounded-lg space-x-2 border dark:border-gray-600 cursor-default"
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-lg ${boxClass} border dark:border-gray-500 flex-shrink-0`}
                      ></div>
                      <span className="font-medium flex-1 break-words min-w-0 text-sm sm:text-base">
                        {item.label}
                      </span>
                      {item.showCount && (
                        <span className="ml-auto bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                          {stats.categories[item.id] || 0}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t dark:border-gray-700"></div>

            {/* Activities Section */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Activities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {keyActivities.map((item) => {
                  const IconC = ICON_MAP[item.icon];
                  const isSelected = highlightFilters.icons.some(
                    (f) => f.icon === item.icon && f.iconColor === item.iconColor
                  );
                  const dispColor =
                    !item.iconColor || item.iconColor === 'none'
                      ? 'text-gray-900 dark:text-gray-100'
                      : item.iconColor;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleIconFilterToggle(item)}
                      className={`flex items-center p-2 rounded-lg space-x-2 border dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 border dark:border-gray-500 flex-shrink-0">
                        {IconC && <IconC size={20} className={dispColor} />}
                      </div>
                      <span className="font-medium flex-1 break-words min-w-0 text-sm sm:text-base">
                        {item.label}
                      </span>
                      {item.showCount && (
                        <span className="ml-auto bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                          {iconCounts[`${item.icon}-${item.iconColor}`] || 0}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
          <h2
            className="text-2xl font-bold mb-4 cursor-pointer flex justify-between"
            onClick={() => setIsStatsExpanded(!isStatsExpanded)}
          >
            {year} Stats{' '}
            <span className="md:hidden">{isStatsExpanded ? <ChevronUp /> : <ChevronDown />}</span>
          </h2>
          <div className={`${isStatsExpanded ? 'block' : 'hidden'} md:block`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold">
                  Days Traveling
                </p>
                <p className="text-3xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">
                  {stats.totalHighlighted} days
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-600 dark:text-purple-300 font-semibold">
                  Time Traveling
                </p>
                <p className="text-3xl font-extrabold text-purple-900 dark:text-purple-100 mt-1">
                  {Math.round((stats.totalHighlighted / stats.totalDays) * 100)}%
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Location Counts</h3>
              <div className="flex flex-wrap gap-2">
                {locationCounts.map(([loc, count]) => (
                  <button
                    type="button"
                    key={loc}
                    onClick={() => handleLocationFilterToggle(loc)}
                    className={`px-3 py-1 rounded-lg flex items-center space-x-2 transition-all border ${highlightFilters.locations.includes(loc) ? 'bg-blue-600 text-white border-transparent shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    <span className="font-medium dark:text-gray-200">{loc}</span>
                    <span className="ml-2 bg-blue-100 text-blue-700 dark:bg-gray-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {isBulkEditMode && selectedCells.length > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border dark:border-gray-700 z-40 flex items-center gap-4">
            <span className="font-bold text-gray-800 dark:text-gray-100">{selectedCells.length} days selected</span>
            <button
              onClick={() => setActiveCell('bulk')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700"
            >
              Edit Selected
            </button>
            <button
              onClick={() => setSelectedCells([])}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-bold"
            >
              Clear
            </button>
          </div>
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
              onToggleMonth={toggleMonth}
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
        dayData={activeCell === 'bulk' ? { month: 'Multiple', day: 'Days', colorId: 'none', icons: [], locations: '', details: '' } : (activeCell ? calendarData[activeCell] : null)}
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
        onAuthenticate={(r, t) => {
          setRole(r);
          setAdminToken(t);
        }}
        isLoading={authLoading}
        setIsLoading={setAuthLoading}
        authError={authError}
      />

      <Footer />
    </div>
  );
}
