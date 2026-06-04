import React from 'react';

interface BulkEditBarProps {
  selectedCells: string[];
  onEditSelected: () => void;
  onClear: () => void;
}

const BulkEditBar: React.FC<BulkEditBarProps> = ({ selectedCells, onEditSelected, onClear }) => {
  return (
    <div className="fixed bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-3 sm:p-4 rounded-xl shadow-2xl border-2 border-indigo-500 dark:border-indigo-500 z-40 flex items-center justify-between gap-4 w-[90%] sm:w-auto min-w-[280px]">
      <span className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base flex-1 text-center sm:text-left">
        {selectedCells.length === 0 ? 'Bulk Edit Active: Select days...' : `${selectedCells.length} days selected`}
      </span>
      {selectedCells.length > 0 && (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onEditSelected}
            className="bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold hover:bg-indigo-700 text-sm"
          >
            Edit
          </button>
          <button
            onClick={onClear}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-sm"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default BulkEditBar;
