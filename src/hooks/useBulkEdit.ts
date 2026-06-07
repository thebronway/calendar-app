import { useState, useCallback } from 'react';

export function useBulkEdit() {
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);

  const toggleBulkEdit = useCallback(() => {
    setIsBulkEditMode((prev) => !prev);
    setSelectedCells([]);
  }, []);

  const clearBulkEdit = useCallback(() => {
    setIsBulkEditMode(false);
    setSelectedCells([]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCells([]);
  }, []);

  const toggleCellSelection = useCallback((key: string) => {
    setSelectedCells((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  return {
    isBulkEditMode,
    selectedCells,
    toggleBulkEdit,
    clearBulkEdit,
    clearSelection,
    toggleCellSelection
  };
}