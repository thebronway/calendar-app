import { useEffect } from 'react';

/**
 * Automatically adds a beforeunload listener to protect against browser tab closures.
 */
export function usePreventTabClose(isDirty: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Required by modern browsers to trigger the native prompt
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
}