import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { MONTHS, CATEGORY_COLORS, ICON_MAP } from '../utils/constants';
import { createDateKey } from '../utils/helpers';
import type { CalendarDataset, DayData, KeyItem } from '../types';

interface MonthViewProps {
  monthIndex: number;
  year: number;
  calendarData: CalendarDataset | null;
  keyItems: KeyItem[];
  isExpanded: boolean;
  onToggleMonth: (idx: number) => void;
  shouldHighlightCell: (dayInfo: DayData) => boolean;
  isBulkEditMode: boolean;
  selectedCells: string[];
  onCellClick: (key: string) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  monthIndex,
  year,
  calendarData,
  keyItems,
  isExpanded,
  onToggleMonth,
  shouldHighlightCell,
  isBulkEditMode,
  selectedCells,
  onCellClick,
}) => {
  const mName = MONTHS[monthIndex];
  const isTodayYear = new Date().getFullYear() === year;
  const firstDay = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const cells: React.ReactNode[] = [];
  let monthHighCount = 0;

  const contentClass = 'min-h-[7rem] h-full flex flex-col justify-between p-1';

  for (let i = 0; i < firstDay; i++) {
    cells.push(
      <td key={`p-${i}`} className="p-1 bg-gray-50 dark:bg-gray-800/50">
        <div className={contentClass}></div>
      </td>
    );
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = createDateKey(year, monthIndex, d);
    const day: DayData = (calendarData && calendarData[key]) || {
      day: d,
      month: mName,
      year,
      locations: '',
      icons: [],
      colorId: 'none',
      details: '',
    };

    if (day.colorId !== 'none') monthHighCount++;

    let colorClass = 'bg-white dark:bg-gray-800';
    if (day.colorId !== 'none') {
      const cat = keyItems.find((k) => k.id === day.colorId);
      if (cat) {
        const cDef = CATEGORY_COLORS.find((c) => c.id === cat.colorCode);
        if (cDef) colorClass = cDef.bg;
      }
    }

    const isHigh = shouldHighlightCell(day);
    const icons = (day.icons || []).filter((i) => i.value !== 'None');
    const isSelected = selectedCells.includes(key);
    const todayKey = createDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    cells.push(
      <td
        key={key}
        onClick={() => onCellClick(key)}
        className={`w-1/7 cursor-pointer align-top transition-opacity hover:opacity-90 ${colorClass}`}
      >
        <div
          className={`${contentClass} ${isSelected ? 'ring-4 ring-purple-500 ring-inset z-20 relative' : isHigh ? 'ring-4 ring-blue-500 ring-inset z-10 relative' : ''}`}
        >
          <div className="flex flex-col items-center">
            <span
              className={`text-xl font-bold ${todayKey === key && isTodayYear ? 'bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center' : day.colorId !== 'none' ? 'text-gray-900' : 'text-gray-800 dark:text-gray-100'}`}
            >
              {d}
            </span>
            {(day.locations || '').split(',').map((l) => l.trim()).filter(Boolean).length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-1.5 w-full">
                {(day.locations || '')
                  .split(',')
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((l, i) => (
                    <span
                      key={i}
                      title={l}
                      className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-white/50 text-gray-900 break-words max-w-full"
                    >
                      {l}
                    </span>
                  ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center items-end mt-1">
            {icons.map((i, idx) => {
              const IC = ICON_MAP[i.value || i.icon || ''];
              const isYellow = i.color === 'text-yellow-500';
              const shadowClass = isYellow
                ? 'dark:[filter:drop-shadow(0px_0px_1px_rgba(0,0,0,1))]'
                : '';
              return IC ? (
                <div key={idx} className="w-1/2 flex justify-center shrink-0 h-[18px] sm:h-6 mb-0.5">
                  <IC
                    className={`${i.color} ${shadowClass} shrink-0 w-[18px] h-[18px] sm:w-6 sm:h-6`}
                    strokeWidth={2.5}
                  />
                </div>
              ) : null;
            })}
          </div>
        </div>
      </td>
    );
  }

  while (cells.length % 7 !== 0) {
    cells.push(
      <td key={`pe-${cells.length}`} className="p-1 bg-gray-50 dark:bg-gray-800/50">
        <div className={contentClass}></div>
      </td>
    );
  }

  const rows: React.ReactNode[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(<tr key={i}>{cells.slice(i, i + 7)}</tr>);
  }

  return (
    <div id={`month-${monthIndex}`} className="w-full md:w-1/2 2xl:w-1/3 p-2">
      <div
        className="flex justify-between items-center mb-2 mt-4 cursor-pointer md:cursor-default select-none"
        onClick={() => onToggleMonth(monthIndex)}
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          {mName}
          <span className="md:hidden ml-2 text-gray-500 transition-transform duration-200">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </span>
        </h2>
        <span className="text-sm font-normal bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
          {monthHighCount} / {daysInMonth} days ({Math.round((monthHighCount / daysInMonth) * 100) || 0}%)
        </span>
      </div>

      {/* Smooth mobile accordion transition */}
      <div
        className={`
          md:block rounded-lg overflow-hidden bg-white dark:bg-gray-800
          ring-1 ring-gray-300 dark:ring-gray-700 transform-gpu [backface-visibility:hidden]
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 md:max-h-[2000px] md:opacity-100'}
        `}
      >
        <table className="w-full table-fixed border-separate border-spacing-[1px] bg-gray-300 dark:bg-gray-700">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((h) => (
                <th key={h} className="p-2 bg-gray-200 dark:bg-gray-800">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-300 dark:bg-gray-700">{rows}</tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthView;
