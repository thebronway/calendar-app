import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { CalendarStats, HighlightFilters, AppConfig } from '../../types';

interface StatsSectionProps {
  config: AppConfig;
  year: number;
  stats: CalendarStats;
  locationCounts: [string, number][];
  highlightFilters: HighlightFilters;
  onLocationFilterToggle: (loc: string) => void;
}

const StatsSection: React.FC<StatsSectionProps> = ({
  config,
  year,
  stats,
  locationCounts,
  highlightFilters,
  onLocationFilterToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === 'undefined') return true;
    const isMobile = window.innerWidth < 768;
    return isMobile ? !config.collapseStatsMobile : !config.collapseStatsDesktop;
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      setIsExpanded(isMobile ? !config.collapseStatsMobile : !config.collapseStatsDesktop);
    }
  }, [config.collapseStatsMobile, config.collapseStatsDesktop]);

  return (
    <section className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
      <h2
        className="text-2xl font-bold mb-4 cursor-pointer flex justify-between select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {year} Stats{' '}
        <span>{isExpanded ? <ChevronUp /> : <ChevronDown />}</span>
      </h2>

      <div className={`${isExpanded ? 'block' : 'hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold">Days Traveling</p>
            <p className="text-3xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">
              {stats.totalHighlighted} days
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-600 dark:text-purple-300 font-semibold">Time Traveling</p>
            <p className="text-3xl font-extrabold text-purple-900 dark:text-purple-100 mt-1">
              {stats.totalDays > 0 ? Math.round((stats.totalHighlighted / stats.totalDays) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3">Location Counts</h3>
          <div className="flex flex-wrap gap-2">
            {locationCounts.map(([loc, count]) => (
              <button
                type="button"
                key={loc}
                onClick={() => onLocationFilterToggle(loc)}
                className={`px-3 py-1 rounded-lg flex items-center space-x-2 transition-all border ${
                  highlightFilters.locations.includes(loc)
                    ? 'bg-theme-accent text-white border-transparent shadow-lg'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                }`}
              >
                <span className="font-medium dark:text-gray-200">{loc}</span>
                <span 
                  className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold transition-colors"
                  style={
                    highlightFilters.locations.includes(loc) 
                      ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' } 
                      : { backgroundColor: `${config.themeAccent || '#3b82f6'}26`, color: config.themeAccent || '#3b82f6' }
                  }
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
