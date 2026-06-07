import { useEffect } from 'react';

interface UseKeyboardShortcutsParams {
  activeCell: string | null;
  showSettingsModal: boolean;
  showKeyModal: boolean;
  showAuthModal: boolean;
  setActiveCell: (cell: string | null) => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowKeyModal: (show: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
  handlePrevNav: () => void;
  handleNextNav: () => void;
}

export function useKeyboardShortcuts({
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
        if (showAuthModal) { setShowAuthModal(false); return; }
      }

      // Arrow keys handle navigation only when no modal is open
      const anyModalOpen = activeCell || showSettingsModal || showKeyModal || showAuthModal;
      if (!anyModalOpen) {
        if (e.key === 'ArrowLeft') handlePrevNav();
        if (e.key === 'ArrowRight') handleNextNav();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
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
  ]);
}