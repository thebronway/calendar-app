import { useState, useEffect, useCallback } from 'react';

/**
 * Tracks whether local state differs from the original saved state.
 * Returns isDirty flag and a reset function.
 */
export function useUnsavedChanges<T>(original: T, current: T): boolean {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(JSON.stringify(original) !== JSON.stringify(current));
  }, [original, current]);

  return isDirty;
}

/**
 * Wraps a close handler with an "unsaved changes" confirmation guard.
 */
export function useCloseGuard(isDirty: boolean, onClose: () => void): () => void {
  return useCallback(() => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Discard them and close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [isDirty, onClose]);
}
