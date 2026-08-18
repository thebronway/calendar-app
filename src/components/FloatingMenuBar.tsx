import React, { useState, useEffect } from 'react';
import { CalendarRange, Key, Rss, Settings, ShieldCheck, X, List, Layout, CalendarDays, ChevronLeft, SlidersHorizontal } from 'lucide-react';
import type { Role } from '../types';

interface FloatingMenuBarProps {
  role: Role;
  routeView: string;
  hasFilters: boolean;
  onViewToggle: (view: 'year' | 'planner' | 'list') => void;
  onClearFilters: () => void;
  onToggleBulkEdit: () => void;
  onOpenKeyModal: () => void;
  onOpenFeeds: () => void;
  onOpenSettings: () => void;
  onOpenAccess: () => void;
  onCloseAllModals: () => Promise<boolean> | void;
  showKeyModal: boolean;
  showFeedsModal: boolean;
  showSettingsModal: boolean;
  showAccessModal: boolean;
}

const FloatingMenuBar: React.FC<FloatingMenuBarProps> = ({
  role, routeView, hasFilters, onViewToggle, onClearFilters,
  onToggleBulkEdit, onOpenKeyModal, onOpenFeeds, onOpenSettings, onOpenAccess, onCloseAllModals,
  showKeyModal, showFeedsModal, showSettingsModal, showAccessModal
}) => {
  const [menuState, setMenuState] = useState<'main' | 'configure'>('main');
  const isAdmin = role === 'admin';

  const anyModalOpen = showKeyModal || showFeedsModal || showSettingsModal || showAccessModal;

  // Automatically switch to configure mode if a modal is open
  useEffect(() => {
    if (anyModalOpen) setMenuState('configure');
  }, [anyModalOpen]);

  // Tab active/dim logic with vibrant colors restored
  const getTabClass = (isOpen: boolean, baseColorClass: string) => {
    const base = `flex-1 sm:flex-none h-10 sm:h-12 px-3 sm:px-5 flex items-center justify-center text-white rounded-full font-bold text-xs sm:text-sm shadow-sm transition-all ${baseColorClass}`;
    
    // Highlight the active tab with a ring and full opacity
    if (isOpen) return `${base} ring-2 ring-white dark:ring-gray-800 ring-inset shadow-lg opacity-100`;
    
    // Dim the other tabs if ANY tab is currently open
    if (anyModalOpen) return `${base} opacity-50 hover:opacity-100`;
    
    // Default state when viewing the menu without an open modal
    return `${base} hover:opacity-90`;
  };

  return (
    <div className="fixed bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 bg-theme-panel/80 backdrop-blur-md p-2 sm:p-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.25)] border border-white/20 dark:border-white/10 z-40 flex items-center justify-center transition-all duration-300 w-auto max-w-[95vw]">
      
      {menuState === 'main' ? (
        <div key="main" className="flex items-center gap-2 sm:gap-3 animate-in fade-in zoom-in duration-300 w-full justify-center">
          {isAdmin && (
            <button
              onClick={onToggleBulkEdit}
              className="flex-1 sm:flex-none h-10 sm:h-12 px-3 sm:px-5 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition-colors font-bold text-xs sm:text-sm shadow-sm"
              title="Bulk Edit"
            >
              <CalendarRange size={18} className="sm:mr-2" />
              <span className="hidden sm:inline">Bulk Edit</span>
            </button>
          )}

          {hasFilters ? (
            <button
              onClick={onClearFilters} 
              className="flex-1 sm:flex-none h-10 sm:h-12 px-4 sm:px-6 bg-theme-item hover:bg-theme-item-hover text-theme-text rounded-full text-xs sm:text-sm font-bold transition-colors flex items-center justify-center border border-theme-grid-divider shadow-sm"
              title="Clear Filters"
            >
              <X size={18} className="mr-1.5 text-theme-accent" />
              <span>Clear Filters</span>
            </button>
          ) : (
            <div className="flex bg-theme-panel p-1 rounded-full items-center shadow-inner h-10 sm:h-12 border border-theme-item">
              <button
                onClick={() => onViewToggle('year')}
                className={`h-full px-4 sm:px-5 text-xs sm:text-sm font-bold rounded-full transition-all flex items-center justify-center ${(!routeView || routeView === 'year') ? 'bg-theme-accent text-theme-accent-text shadow-md' : 'text-theme-text-secondary hover:text-theme-text'}`}
                title="Year View"
              >
                <CalendarDays size={16} className="sm:mr-1.5" />
                <span className="hidden sm:inline">Year</span>
              </button>
              <button
                onClick={() => onViewToggle('planner')}
                className={`h-full px-4 sm:px-5 text-xs sm:text-sm font-bold rounded-full transition-all flex items-center justify-center ${routeView === 'planner' ? 'bg-theme-accent text-theme-accent-text shadow-md' : 'text-theme-text-secondary hover:text-theme-text'}`}
                title="Planner View"
              >
                <Layout size={16} className="sm:mr-1.5" />
                <span className="hidden sm:inline">Planner</span>
              </button>
              <button
                onClick={() => onViewToggle('list')}
                className={`h-full px-4 sm:px-5 text-xs sm:text-sm font-bold rounded-full transition-all flex items-center justify-center ${routeView === 'list' ? 'bg-theme-accent text-theme-accent-text shadow-md' : 'text-theme-text-secondary hover:text-theme-text'}`}
                title="List View"
              >
                <List size={16} className="sm:mr-1.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          )}

          {isAdmin && (
            <button
              onClick={() => setMenuState('configure')}
              className="flex-1 sm:flex-none h-10 sm:h-12 px-3 sm:px-5 flex items-center justify-center bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 text-white rounded-full transition-colors font-bold text-xs sm:text-sm shadow-sm"
              title="Configure"
            >
              <SlidersHorizontal size={18} className="sm:mr-2" />
              <span className="hidden sm:inline">Configure</span>
            </button>
          )}
        </div>
      ) : (
        <div key="configure" className="flex items-center gap-2 sm:gap-3 animate-in fade-in zoom-in duration-300 w-full justify-center">
          <button
            onClick={async () => {
               if (anyModalOpen) {
                 const success = await onCloseAllModals();
                 if (success !== false) setMenuState('main');
               } else {
                 setMenuState('main');
               }
            }} 
            className="flex-1 sm:flex-none h-10 sm:h-12 px-3 sm:px-4 flex items-center justify-center bg-theme-item text-theme-text-secondary hover:text-theme-text rounded-full hover:bg-theme-item-hover transition-colors font-bold text-xs sm:text-sm" 
            title="Back"
          >
            <ChevronLeft size={18} className="sm:mr-1" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <button onClick={onOpenKeyModal} className={getTabClass(showKeyModal, 'bg-purple-600')} title="Key">
            <Key size={18} className="sm:mr-1.5" />
            <span className="hidden md:inline">Key</span>
          </button>
          <button onClick={onOpenFeeds} className={getTabClass(showFeedsModal, 'bg-orange-500')} title="Feeds">
            <Rss size={18} className="sm:mr-1.5" />
            <span className="hidden md:inline">Feeds</span>
          </button>
          <button onClick={onOpenAccess} className={getTabClass(showAccessModal, 'bg-emerald-600')} title="Access">
            <ShieldCheck size={18} className="sm:mr-1.5" />
            <span className="hidden md:inline">Access</span>
          </button>
          <button onClick={onOpenSettings} className={getTabClass(showSettingsModal, 'bg-blue-600')} title="Settings">
            <Settings size={18} className="sm:mr-1.5" />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingMenuBar;