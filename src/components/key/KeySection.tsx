import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, List, Layout } from 'lucide-react';
import { CATEGORY_COLORS, ICON_MAP } from '../../utils/constants';
import type { CalendarStats, HighlightFilters, KeyItem } from '../../types';

interface KeySectionProps {
  keyItems: KeyItem[];
  stats: CalendarStats;
  iconCounts: Record<string, number>;
  highlightFilters: HighlightFilters;
  onIconFilterToggle: (item: Pick<KeyItem, 'icon' | 'iconColor'>) => void;
  onCategoryFilterToggle: (categoryId: string) => void;
  onClearFilters: () => void;
  onViewAsList: () => void;
  onViewAsPlanner: () => void;
}

const KeySection: React.FC<KeySectionProps> = ({
  keyItems,
  stats,
  iconCounts,
  highlightFilters,
  onIconFilterToggle,
  onCategoryFilterToggle,
  onClearFilters,
  onViewAsList,
  onViewAsPlanner,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const keyCategories = keyItems.filter((k) => k.isColorKey);
  const keyActivities = keyItems.filter((k) => !k.isColorKey);
  const hasActiveFilters =
    highlightFilters.locations.length > 0 || highlightFilters.icons.length > 0 || highlightFilters.categories?.length > 0;

  return (
    <section className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
      <div
        className="flex justify-between items-center mb-4 cursor-pointer md:cursor-default"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Key</h2>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAsList();
                }}
                className="text-xs sm:text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-300 px-2 sm:px-3 py-1.5 rounded-lg font-bold flex items-center transition-colors"
              >
                <List size={16} className="mr-1.5 hidden sm:block" />
                View as List
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAsPlanner();
                }}
                className="text-xs sm:text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 px-2 sm:px-3 py-1.5 rounded-lg font-bold flex items-center transition-colors"
              >
                <Layout size={16} className="mr-1.5 hidden sm:block" />
                View as Planner
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFilters();
                }}
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium flex items-center transition-colors bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1.5 rounded-lg"
              >
                <X size={16} className="sm:mr-1" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          )}
          <span className="md:hidden text-gray-800 dark:text-gray-100">
            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </span>
        </div>
      </div>

      <div className={`${isExpanded ? 'block' : 'hidden'} md:block space-y-6`}>
        {/* Categories */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {keyCategories.map((item) => {
              const cDef = CATEGORY_COLORS.find((c) => c.id === item.colorCode);
              const boxClass = cDef
                ? `${cDef.bg} text-white dark:text-gray-100`
                : 'bg-gray-100';
              const isSelected = highlightFilters.categories?.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => onCategoryFilterToggle(item.id)}
                  className={`flex items-center p-2 rounded-lg space-x-2 border dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-lg ${boxClass} border dark:border-gray-500 flex-shrink-0`}
                  />
                  <span className="font-medium flex-1 break-words min-w-0 text-sm sm:text-base">
                    {item.label}
                  </span>
                  {item.showCount && (
                    <span className="ml-auto bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                      {stats.categories[item.id] || 0}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t dark:border-gray-700" />

        {/* Activities */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Activities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {keyActivities.map((item) => {
              const IconC = item.icon ? ICON_MAP[item.icon] : null;
              const isSelected = highlightFilters.icons.some(
                (f) => f.icon === item.icon && f.iconColor === item.iconColor
              );
              const dispColor =
                !item.iconColor || item.iconColor === 'none'
                  ? 'text-gray-900 dark:text-gray-100'
                  : item.iconColor;
              return (
                <div
                  key={item.id}
                  onClick={() => onIconFilterToggle(item)}
                  className={`flex items-center p-2 rounded-lg space-x-2 border dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 border dark:border-gray-500 flex-shrink-0">
                    {IconC && <IconC size={20} className={dispColor} />}
                  </div>
                  <span className="font-medium flex-1 break-words min-w-0 text-sm sm:text-base">
                    {item.label}
                  </span>
                  {item.showCount && (
                    <span className="ml-auto bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                      {iconCounts[`${item.icon}-${item.iconColor}`] || 0}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default KeySection;
