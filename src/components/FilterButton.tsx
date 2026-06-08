import React from 'react';

interface FilterButtonProps {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  isSelected,
  onClick,
  children,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-md font-medium border transition-all flex items-center gap-1.5 ${
        isSelected
          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
          : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
      } ${className}`}
    >
      {children}
    </button>
  );
};