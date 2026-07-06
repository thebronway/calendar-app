import React, { useMemo } from 'react';
import { ICON_MAP, CATEGORY_COLORS } from '../utils/constants';
import type { CalendarDataset, KeyItem } from '../types';

interface ListViewProps {
  calendarData: CalendarDataset | null;
  keyItems: KeyItem[];
  onCellClick: (key: string) => void;
}

const ListView: React.FC<ListViewProps> = ({ calendarData, keyItems, onCellClick }) => {
  const activeDays = useMemo(() => {
    if (!calendarData) return [];
    return Object.entries(calendarData)
      // Only show days that have a category or at least one icon
      .filter(([_, day]) => day.colorId !== 'none' || (day.icons && day.icons.length > 0))
      .map(([key, day]) => ({ key, ...day }))
      // Sort chronologically (YYYY-MM-DD)
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [calendarData]);

  if (activeDays.length === 0) {
    return (
      <div className="text-center py-12 bg-theme-panel rounded-xl border border-theme-item shadow-sm mt-4">
        <p className="text-lg text-theme-text-secondary font-medium">No events found for the selected filters.</p>
      </div>
    );
  }

  let currentMonth = '';

  return (
    <div className="bg-theme-panel rounded-xl shadow-sm border border-theme-item overflow-hidden mt-4">
      {activeDays.map((day) => {
        const showMonthHeader = day.month !== currentMonth;
        if (showMonthHeader) currentMonth = day.month;

        const category = keyItems.find((k) => k.id === day.colorId);
        const colorDef = category ? CATEGORY_COLORS.find((c) => c.id === category.colorCode) : null;
        const catClass = colorDef ? `${colorDef.bg} text-white dark:text-gray-900` : 'bg-theme-panel text-theme-text border border-theme-item';

        const [y, m, d] = day.key.split('-');
        const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

        return (
          <React.Fragment key={day.key}>
            {showMonthHeader && (
              <div className="bg-theme-item px-6 py-3 border-b border-t first:border-t-0 border-theme-item">
                <h3 className="text-lg font-bold text-theme-text">{day.month} {day.year}</h3>
              </div>
            )}
            <div 
              onClick={() => onCellClick(day.key)}
              className="flex flex-col sm:flex-row sm:items-center px-6 py-4 border-b border-theme-item last:border-b-0 hover:bg-theme-item-hover cursor-pointer transition-colors gap-4"
            >
              <div className="w-16 flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-lg bg-theme-item border border-theme-item">
                <span className="text-xs font-bold text-theme-text-secondary uppercase">{dayOfWeek}</span>
                <span className="text-xl font-extrabold text-theme-text">{day.day}</span>
              </div>
              
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {category && (
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${catClass}`}>
                      {category.label}
                    </span>
                  )}
                  {day.locations && (
                    <span className="text-sm font-medium text-theme-text-secondary flex items-center">
                      📍 {day.locations}
                    </span>
                  )}
                </div>
                {day.icons && day.icons.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {day.icons.map((icon, idx) => {
                      const IC = ICON_MAP[icon.value || icon.icon || ''];
                      const keyDef = keyItems.find(k => k.icon === (icon.value || icon.icon) && k.iconColor === icon.color);
                      const label = icon.displayName || (keyDef ? keyDef.label : (icon.value || icon.icon));
                      return IC ? (
                        <div key={idx} className="flex items-center gap-1.5 bg-theme-panel border border-theme-item px-2 py-1 rounded-md shadow-sm">
                          <IC size={16} className={icon.color} />
                          <span className="text-sm font-medium text-theme-text">{label}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ListView;