import React, { useRef } from 'react';
import { X, GripVertical, Plus } from 'lucide-react';
import ToggleSwitch from '../ToggleSwitch';
import { CATEGORY_COLORS } from '../../utils/constants';
import { slugify } from '../../utils/helpers';
import type { KeyItem } from '../../types';

interface CategoryManagerProps {
  categories: KeyItem[];
  onUpdateItem: (id: string, field: keyof KeyItem, value: KeyItem[keyof KeyItem]) => void;
  onDeleteItem: (id: string) => void;
  onAddCategory: () => void;
  onReorder: (newCategories: KeyItem[]) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onUpdateItem,
  onDeleteItem,
  onAddCategory,
  onReorder,
}) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _categories = [...categories];
    const dragged = _categories.splice(dragItem.current, 1)[0];
    _categories.splice(dragOverItem.current, 0, dragged);
    onReorder(_categories);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="hidden md:block text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Categories</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Categories color the background of the day cell.{' '}
            <span className={`font-bold ${categories.length >= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'}`}>
              ({categories.length}/5 used)
            </span>
          </p>
        </div>
        <button 
          onClick={onAddCategory} 
          disabled={categories.length >= 5} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} className="mr-2" /> Add
        </button>
      </div>

      <div className="grid gap-4">
        {categories.map((cat, index) => (
          <div 
            key={cat.id} 
            draggable
            onDragStart={() => (dragItem.current = index)}
            onDragEnter={() => (dragOverItem.current = index)}
            onDragEnd={handleSort}
            onDragOver={(e) => e.preventDefault()}
            className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-4 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="text-gray-400 shrink-0 hidden md:block" />
            <div className="flex gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onUpdateItem(cat.id, 'colorCode', c.id)}
                  className={`w-8 h-8 rounded-full ${c.bg} ${cat.colorCode === c.id ? 'ring-2 ring-offset-2 ring-gray-800 dark:ring-gray-200' : 'opacity-50 hover:opacity-100'}`}
                />
              ))}
            </div>
            <div className="flex-1 w-full min-w-0">
              <input
                type="text"
                value={cat.label}
                onChange={(e) => onUpdateItem(cat.id, 'label', e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                placeholder="Category Name"
              />
              {cat.label && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1 truncate" title={slugify(cat.label)}>
                  URL ID: <span className="font-mono">{slugify(cat.label)}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Count</span>
              <ToggleSwitch checked={!!cat.showCount} onChange={() => onUpdateItem(cat.id, 'showCount', !cat.showCount)} />
            </div>
            <div className="flex items-center space-x-1 border-l pl-2 dark:border-gray-700">
              <button onClick={() => onDeleteItem(cat.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>
        ))}
        
        <div className="mt-6 pt-6 border-t dark:border-gray-700">
          <button 
            onClick={onAddCategory} 
            disabled={categories.length >= 5} 
            className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed border border-dashed border-blue-300 dark:border-blue-700"
          >
            <Plus size={16} className="mr-2" /> Add Category
          </button>
          {categories.length >= 5 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium text-center mt-2">
              Maximum of 5 categories reached.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;