import { useEffect } from 'react';
import type { Role } from '../types';

interface UseKeyboardShortcutsParams {
  activeCell: string | null;
  showSettingsModal: boolean;
  showKeyModal: boolean;
  showFeedsModal: boolean;
  showHelpModal: boolean;
  showAccessModal: boolean;
  showWelcome: boolean;
  setActiveCell: (cell: string | null) => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowKeyModal: (show: boolean) => void;
  setShowFeedsModal: (show: boolean) => void;
  setShowHelpModal: (show: boolean) => void;
  setShowAccessModal: (show: boolean) => void;
  onCloseWelcome: () => void;
  handlePrevNav: () => void;
  handleNextNav: () => void;
  onToggleBulkEdit: () => void;
  onToggleDarkMode: () => void;
  onViewToggle: (view: 'year' | 'planner' | 'list') => void;
  onGoToGuide: () => void;
  routeView: string;
  year: number;
  navigate: (path: string) => void;
  role: Role;
}

export function useKeyboardShortcuts({
  activeCell,
  showSettingsModal,
  showKeyModal,
  showFeedsModal,
  showHelpModal,
  showAccessModal,
  showWelcome,
  setActiveCell,
  setShowSettingsModal,
  setShowKeyModal,
  setShowFeedsModal,
  setShowHelpModal,
  setShowAccessModal,
  onCloseWelcome,
  handlePrevNav,
  handleNextNav,
  onToggleBulkEdit,
  onToggleDarkMode,
  onViewToggle,
  onGoToGuide,
  routeView,
  year,
  navigate,
  role,
}: UseKeyboardShortcutsParams) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      // ESC closes any open modal
      if (e.key === 'Escape') {
        if (activeCell) { setActiveCell(null); return; }
        if (showSettingsModal) { setShowSettingsModal(false); return; }
        if (showKeyModal) { setShowKeyModal(false); return; }
        if (showFeedsModal) { setShowFeedsModal(false); return; }
        if (showHelpModal) { setShowHelpModal(false); return; }
        if (showAccessModal) { setShowAccessModal(false); return; }
        if (showWelcome) { onCloseWelcome(); return; }
      }

      // Hotkeys handle navigation only when no modal is open
      const anyModalOpen = activeCell || showSettingsModal || showKeyModal || showFeedsModal || showHelpModal || showAccessModal || showWelcome;
      
      if (!anyModalOpen) {
        let matched = false;

        if (e.key === 'ArrowLeft') { handlePrevNav(); matched = true; }
        if (e.key === 'ArrowRight') { handleNextNav(); matched = true; }

        const key = e.key.toLowerCase();
        
        // Admin
        if (key === 'b' && role === 'admin') { onToggleBulkEdit(); matched = true; }
        if (key === 'c' && role === 'admin') { setShowAccessModal(true); matched = true; }
        if (key === 'k' && role === 'admin') { setShowKeyModal(true); matched = true; }
        if (key === 'f' && role === 'admin') { setShowFeedsModal(true); matched = true; }
        if (key === 's' && role === 'admin') { setShowSettingsModal(true); matched = true; }
        if (key === 'u' && role === 'admin') { onGoToGuide(); matched = true; }
        
        // Global
        if (key === 'a') { navigate('/login'); matched = true; }
        if (key === 'h') { setShowHelpModal(true); matched = true; }
        if (key === 'd') { onToggleDarkMode(); matched = true; }
        if (key === 'y') { onViewToggle('year'); matched = true; }
        if (key === 'p') { onViewToggle('planner'); matched = true; }
        if (key === 'l') { onViewToggle('list'); matched = true; }
        
        if (key === 'm') {
          const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase();
          navigate(`/${year}/${currentMonth}${window.location.search}`);
          matched = true;
        }
        
        if (key === 'v') {
          if (!routeView || routeView === 'year') onViewToggle('planner');
          else if (routeView === 'planner') onViewToggle('list');
          else onViewToggle('year');
          matched = true;
        }

        if (matched) {
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeCell, showSettingsModal, showKeyModal, showFeedsModal, showHelpModal, showAccessModal, showWelcome,
    setActiveCell, setShowSettingsModal, setShowKeyModal, setShowFeedsModal, setShowHelpModal, setShowAccessModal, onCloseWelcome,
    handlePrevNav, handleNextNav, onToggleBulkEdit, onToggleDarkMode, onViewToggle, onGoToGuide,
    routeView, year, navigate, role
  ]);
}