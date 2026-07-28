import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CATEGORY_COLORS } from '../../utils/constants';
import type { CalendarStats, HighlightFilters, AppConfig, KeyItem } from '../../types';

interface StatsSectionProps {
  config: AppConfig;
  year: number;
  stats: CalendarStats;
  locationCounts: [string, number][];
  highlightFilters: HighlightFilters;
  onLocationFilterToggle: (loc: string) => void;
  keyItems: KeyItem[];
}

const StatsSection: React.FC<StatsSectionProps> = ({
  config,
  year,
  stats,
  locationCounts,
  highlightFilters,
  onLocationFilterToggle,
  keyItems,
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

  const categories = keyItems.filter((k) => k.isColorKey);
  const useSplitLayout = categories.length > 1;
  const totalPercentage = stats.totalDays > 0 ? Math.round((stats.totalHighlighted / stats.totalDays) * 100) : 0;

  const renderCategoryBubble = (category: KeyItem) => {
    const isCustomHex = category.colorCode?.startsWith('#');
    const colorDef = CATEGORY_COLORS.find((c) => c.id === category.colorCode);
    const catClass = colorDef
      ? `${colorDef.bg} text-white dark:text-gray-900 border-transparent`
      : (isCustomHex ? 'text-white dark:text-gray-900 border-transparent' : 'bg-theme-panel text-theme-text border border-theme-item');

    return (
      <span
        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${catClass}`}
        style={{ backgroundColor: isCustomHex ? category.colorCode : undefined }}
      >
        {category.label}
      </span>
    );
  };

  return (
    <section className="bg-theme-panel p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
      <h2
        className="text-2xl font-bold text-theme-text mb-4 cursor-pointer flex justify-between select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {year} Stats{' '}
        <span>{isExpanded ? <ChevronUp /> : <ChevronDown />}</span>
      </h2>

      <div className={`${isExpanded ? 'block' : 'hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DAYS CARD */}
          <div className="p-4 bg-theme-accent/5 dark:bg-theme-accent/10 rounded-lg border border-theme-accent/30 dark:border-theme-accent/30 flex min-h-[100px]">
            {useSplitLayout ? (
              <>
                <div className="w-1/3 flex flex-col justify-center pr-4">
                  <p className="text-sm text-theme-accent font-semibold">Days</p>
                  <p className="text-3xl font-extrabold text-theme-text mt-1">{stats.totalHighlighted}</p>
                </div>
                <div className="w-px bg-theme-accent/30 dark:bg-theme-accent/30 my-2"></div>
                <div className="w-2/3 flex flex-col justify-center pl-4 space-y-2 py-1">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-3">
                      {renderCategoryBubble(cat)}
                      <span className="text-sm font-bold text-theme-text">
                        {stats.categories[cat.id] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center">
                <p className="text-sm text-theme-accent font-semibold">Days</p>
                <p className="text-3xl font-extrabold text-theme-text mt-1">
                  {stats.totalHighlighted}
                </p>
              </div>
            )}
          </div>

          {/* TIME CARD */}
          <div className="p-4 bg-theme-accent-secondary/5 dark:bg-theme-accent-secondary/10 rounded-lg border border-theme-accent-secondary/30 dark:border-theme-accent-secondary/30 flex min-h-[100px]">
            {useSplitLayout ? (
              <>
                <div className="w-1/3 flex flex-col justify-center pr-4">
                  <p className="text-sm text-theme-accent-secondary font-semibold">Time</p>
                  <p className="text-3xl font-extrabold text-theme-text mt-1">{totalPercentage}%</p>
                </div>
                <div className="w-px bg-theme-accent-secondary/30 dark:bg-theme-accent-secondary/30 my-2"></div>
                <div className="w-2/3 flex flex-col justify-center pl-4 space-y-2 py-1">
                  {categories.map((cat) => {
                    const count = stats.categories[cat.id] || 0;
                    const pct = stats.totalDays > 0 ? Math.round((count / stats.totalDays) * 100) : 0;
                    return (
                      <div key={cat.id} className="flex items-center gap-3">
                        {renderCategoryBubble(cat)}
                        <span className="text-sm font-bold text-theme-text">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center">
                <p className="text-sm text-theme-accent-secondary font-semibold">Time</p>
                <p className="text-3xl font-extrabold text-theme-text mt-1">
                  {totalPercentage}%
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t dark:border-gray-700">
          <h3 className="text-xs font-bold text-theme-text-secondary uppercase tracking-wider mb-3 flex items-center">
            Locations
            <span className="ml-2 bg-theme-accent/10 text-theme-accent border border-theme-accent/20 px-2 py-0.5 rounded-full lowercase tracking-normal shadow-sm">
              {locationCounts.length} total
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {locationCounts.map(([loc, count]) => (
              <button
                type="button"
                key={loc}
                onClick={() => onLocationFilterToggle(loc)}
                className={`px-3 py-1 rounded-lg flex items-center space-x-2 transition-all border ${
                  highlightFilters.locations.includes(loc)
                    ? 'bg-theme-accent text-theme-accent-text border-transparent shadow-lg'
                    : 'bg-theme-item hover:bg-theme-item-hover border-gray-200 dark:border-gray-700'
                }`}
              >
                <span className="font-medium text-theme-text">{loc}</span>
                <span 
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold transition-colors border ${
                    highlightFilters.locations.includes(loc)
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-theme-accent/10 text-theme-accent border-theme-accent/20'
                  }`}
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
