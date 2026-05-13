import React from 'react';

interface BulkEditBarProps {
  selectedCells: string[];
  onEditSelected: () => void;
  onClear: () => void;
}

const BulkEditBar: React.FC<BulkEditBarProps> = ({ selectedCells, onEditSelected, onClear }) => {
  if (selectedCells.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border dark:border-gray-700 z-40 flex items-center gap-4">
      <span className="font-bold text-gray-800 dark:text-gray-100">
        {selectedCells.length} days selected
      </span>
      <button
        onClick={onEditSelected}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700"
      >
        Edit Selected
      </button>
      <button
        onClick={onClear}
        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-bold"
      >
        Clear
      </button>
    </div>
  );
};

export default BulkEditBar;
