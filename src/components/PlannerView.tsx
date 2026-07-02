import React, { useMemo } from 'react';
import { MONTHS, CATEGORY_COLORS, ICON_MAP } from '../utils/constants';
import MonthView from './MonthView';
import type { CalendarDataset, KeyItem, DayData } from '../types';

interface PlannerViewProps {
  year: number;
  calendarData: CalendarDataset | null;
  keyItems: KeyItem[];
  shouldHighlightCell: (dayInfo: DayData) => boolean;
  showStats: boolean;
  isBulkEditMode: boolean;
  selectedCells: string[];
  onCellClick: (key: string) => void;
}

const PlannerView: React.FC<PlannerViewProps> = ({
  year,
  calendarData,
  keyItems,
  shouldHighlightCell,
  showStats,
  isBulkEditMode,
  selectedCells,
  onCellClick,
}) => {
  const monthData = useMemo(() => {
    if (!calendarData) return [];
    
    const activeDays = Object.entries(calendarData)
      .filter(([_, day]) => day.colorId !== 'none' || (day.icons && day.icons.length > 0))
      .map(([key, day]) => ({ key, ...day }))
      .sort((a, b) => a.key.localeCompare(b.key));

    return MONTHS.map(month => ({
      month,
      days: activeDays.filter(day => day.month === month)
    }));
  }, [calendarData]);

  return (
    <div className="mt-4 space-y-8">
      {monthData.map(({ month, days }, idx) => {
        if (days.length === 0) return null;
        
        const daysInMonth = new Date(Date.UTC(year, idx + 1, 0)).getUTCDate();

        return (
          <div key={month} className="rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden break-inside-avoid mb-8">
            
            {/* FULL WIDTH HEADER */}
            <div className="bg-gray-100 dark:bg-gray-900 px-6 py-3 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{month} {year}</h3>
              {showStats && (
                <span className="text-sm font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full shadow-sm">
                  {days.length} / {daysInMonth} days
                </span>
              )}
            </div>

            {/* 3-COLUMN CONTENT */}
            <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
              {/* Column 1: Month View Grid */}
              <div className="lg:col-span-1">
                <MonthView
                  monthIndex={idx}
                  year={year}
                  calendarData={calendarData}
                  keyItems={keyItems}
                  isExpanded={true}
                  onToggleMonth={() => {}}
                  shouldHighlightCell={shouldHighlightCell}
                  showStats={showStats}
                  isBulkEditMode={isBulkEditMode}
                  selectedCells={selectedCells}
                  onCellClick={onCellClick}
                  onMonthClick={() => {}}
                  className="w-full"
                  isPlanner={true}
                />
              </div>

              {/* Columns 2 & 3: Flowing List */}
              <div className="lg:col-span-2 columns-1 md:columns-2 gap-6">
                {days.map((day) => {
                  const category = keyItems.find((k) => k.id === day.colorId);
                  const colorDef = category ? CATEGORY_COLORS.find((c) => c.id === category.colorCode) : null;
                  const catClass = colorDef ? `${colorDef.bg} text-white dark:text-gray-900` : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';

                  const [y, m, d] = day.key.split('-');
                  const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
                  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

                  return (
                    <div 
                      key={day.key}
                      onClick={() => onCellClick(day.key)}
                      className="break-inside-avoid bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex px-4 py-3 gap-4">
                        <div className="w-14 flex-shrink-0 flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 h-fit">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">{dayOfWeek}</span>
                          <span className="text-lg font-extrabold text-gray-900 dark:text-gray-100 leading-none mt-0.5">{day.day}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {category && (
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${catClass}`}>
                                {category.label}
                              </span>
                            )}
                            {day.locations && (
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                                📍 {day.locations}
                              </span>
                            )}
                          </div>
                          {day.icons && day.icons.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {day.icons.map((icon, i) => {
                                const IC = ICON_MAP[icon.value || icon.icon || ''];
                                const keyDef = keyItems.find(k => k.icon === (icon.value || icon.icon) && k.iconColor === icon.color);
                                const label = icon.displayName || (keyDef ? keyDef.label : (icon.value || icon.icon));
                                return IC ? (
                                  <div key={i} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-600 px-2 py-1 rounded-md shadow-sm">
                                    <IC size={14} className={icon.color} />
                                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{label}</span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlannerView;