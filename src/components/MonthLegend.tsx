import React, { useMemo } from 'react';
import { ICON_MAP, CATEGORY_COLORS } from '../utils/constants';
import type { CalendarDataset, KeyItem } from '../types';

interface MonthLegendProps {
  month: string;
  calendarData: CalendarDataset | null;
  keyItems: KeyItem[];
}

const MonthLegend: React.FC<MonthLegendProps> = ({ month, calendarData, keyItems }) => {
  const activeKeys = useMemo(() => {
    const categories = new Set<string>();
    const activities = new Set<string>(); // Store as iconId-color to ensure uniqueness

    if (calendarData) {
      Object.values(calendarData).forEach(day => {
        if (day.month !== month) return;

        if (day.colorId && day.colorId !== 'none') {
          categories.add(day.colorId);
        }

        if (day.icons && day.icons.length > 0) {
          day.icons.forEach(icon => {
            const iconVal = icon.value || icon.icon;
            activities.add(`${iconVal}|${icon.color}`);
          });
        }
      });
    }

    const activeCategories = keyItems.filter(k => k.isColorKey && categories.has(k.id));
    const activeActivities = keyItems.filter(k => !k.isColorKey && k.icon && activities.has(`${k.icon}|${k.iconColor}`));

    return { activeCategories, activeActivities };
  }, [month, calendarData, keyItems]);

  if (activeKeys.activeCategories.length === 0 && activeKeys.activeActivities.length === 0) {
    return null; // Don't render anything if the month is empty
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 w-full md:w-56 lg:w-64 flex-shrink-0">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">
        {month} Key
      </h3>

      {activeKeys.activeCategories.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categories</h4>
          <div className="space-y-2.5">
            {activeKeys.activeCategories.map(cat => {
              const colorDef = CATEGORY_COLORS.find(c => c.id === cat.colorCode);
              const bgClass = colorDef ? colorDef.bg : 'bg-gray-200 dark:bg-gray-700';
              return (
                <div key={cat.id} className="flex items-center space-x-2.5">
                  <div className={`w-4 h-4 rounded ${bgClass} border border-black/10 dark:border-white/10`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-tight">{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeKeys.activeActivities.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Activities</h4>
          <div className="space-y-2.5">
            {activeKeys.activeActivities.map(act => {
              const IconComponent = act.icon ? ICON_MAP[act.icon] : null;
              const iconColor = !act.iconColor || act.iconColor === 'none' ? 'text-gray-900 dark:text-gray-100' : act.iconColor;
              return (
                <div key={act.id} className="flex items-center space-x-2.5">
                  <div className="w-5 flex justify-center flex-shrink-0">
                    {IconComponent && <IconComponent size={18} className={iconColor} />}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-tight">{act.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthLegend;