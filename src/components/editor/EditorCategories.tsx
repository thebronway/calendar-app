import React from 'react';
import { Check } from 'lucide-react';

export interface CategoryOption {
  id: string;
  label: string;
  class: string;
  bgClass: string;
}

interface EditorCategoriesProps {
  categories: CategoryOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const EditorCategories: React.FC<EditorCategoriesProps> = ({ categories, selectedId, onSelect }) => {
  return (
    <div className="shrink-0">
      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Category</h4>
      <div className="flex flex-wrap gap-2 min-h-12 items-center">
        {categories.map((color) => {
          const isSelected = selectedId === color.id;
          return (
            <button
              key={color.id}
              onClick={() => onSelect(color.id)}
              className={`flex items-center px-3 py-1.5 rounded-full border transition-all text-sm font-medium ${
                isSelected
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <div className={`w-3 h-3 rounded-full mr-2 shrink-0 ${color.bgClass}`} />
              {color.label}
              {isSelected && <Check size={14} className="ml-1.5 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};