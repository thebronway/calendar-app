import { useState } from 'react';

export function useModals() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [activeCell, setActiveCell] = useState<string | null>(null);

  return {
    showAuthModal, setShowAuthModal,
    showSettingsModal, setShowSettingsModal,
    showKeyModal, setShowKeyModal,
    activeCell, setActiveCell,
  };
}