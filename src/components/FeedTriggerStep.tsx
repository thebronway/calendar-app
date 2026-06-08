import React from 'react';
import { ICON_MAP } from '../utils/constants';

export interface FeedTriggerStepProps {
  triggerType: 'data' | 'location';
  setTriggerType: (val: 'data' | 'location') => void;
  dataTriggerMode?: 'categories' | 'activities' | 'both';
  setDataTriggerMode: (val: 'categories' | 'activities' | 'both') => void;
  dataLogicalOperator?: 'AND' | 'OR';
  setDataLogicalOperator: (val: 'AND' | 'OR') => void;
  selectedCategories: string[];
  setSelectedCategories: (val: string[]) => void;
  selectedActivities: string[];
  setSelectedActivities: (val: string[]) => void;
  locationMode?: 'any' | 'specific';
  setLocationMode: (val: 'any' | 'specific') => void;
  selectedLocations: string[];
  setSelectedLocations: (val: string[]) => void;
  availableCategories: Array<{ id: string; label: string }>;
  availableActivities: Array<{ icon: string; value: string; label: string; color?: string }>;
  availableLocations: string[];
  currentYear: number;
}

export const FeedTriggerStep: React.FC<FeedTriggerStepProps> = ({
  triggerType, setTriggerType,
  dataTriggerMode, setDataTriggerMode,
  dataLogicalOperator, setDataLogicalOperator,
  selectedCategories, setSelectedCategories,
  selectedActivities, setSelectedActivities,
  locationMode, setLocationMode,
  selectedLocations, setSelectedLocations,
  availableCategories,
  availableActivities,
  availableLocations,
  currentYear
}) => {
  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="border dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/40 space-y-4">
      <div className="flex items-center space-x-2 border-b dark:border-gray-700 pb-2">
        <div className="bg-blue-500 text-white font-black rounded-full w-5 h-5 flex items-center justify-center text-xs">1</div>
        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Step 1: Choose what creates an event</h4>
      </div>

      {/* Trigger Type Selection */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTriggerType('data')}
          className={`p-2.5 border rounded-lg text-sm font-bold transition-all ${
            triggerType === 'data'
              ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          Categories / Activities
        </button>
        <button
          type="button"
          onClick={() => setTriggerType('location')}
          className={`p-2.5 border rounded-lg text-sm font-bold transition-all ${
            triggerType === 'location'
              ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          Locations
        </button>
      </div>

      {/* PATH A: DATA TRIGGERS */}
      {triggerType === 'data' && (
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Match By</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { value: 'categories', label: 'Categories Only' },
                { value: 'activities', label: 'Activities Only' },
                { value: 'both', label: 'Categories & Activities' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDataTriggerMode(opt.value as any)}
                  className={`p-2 border rounded-lg text-sm font-bold transition-all ${
                    dataTriggerMode === opt.value
                      ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {dataTriggerMode === 'both' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Requirement</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { value: 'OR', label: 'Any match triggers (OR)' },
                  { value: 'AND', label: 'Both must exist on day (AND)' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDataLogicalOperator(opt.value as any)}
                    className={`p-2 border rounded-lg text-sm font-bold transition-all ${
                      dataLogicalOperator === opt.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Sub-selector */}
          {(dataTriggerMode === 'categories' || dataTriggerMode === 'both') && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Categories</label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto border p-2 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleSelection(cat.id, selectedCategories, setSelectedCategories)}
                    className={`px-2 py-1 text-xs rounded-md font-medium border transition-all ${
                      selectedCategories.includes(cat.id)
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Activity Sub-selector */}
          {(dataTriggerMode === 'activities' || dataTriggerMode === 'both') && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Activities</label>
              <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto border p-2 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
                {availableActivities.map((act) => {
                  const IconComponent = act.icon ? ICON_MAP[act.icon] : null;
                  const isSelected = selectedActivities.includes(act.value);
                  return (
                    <button
                      key={act.value}
                      type="button"
                      onClick={() => toggleSelection(act.value, selectedActivities, setSelectedActivities)}
                      className={`px-2 py-1.5 text-xs rounded-md font-medium border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {IconComponent && (
                        <IconComponent 
                          size={14} 
                          className={isSelected ? 'text-white' : (act.color === 'none' ? '' : act.color)} 
                        />
                      )}
                      <span>{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PATH B: GEOGRAPHIC LOCATION TRIGGERS */}
      {triggerType === 'location' && (
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location Criteria</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { value: 'any', label: 'Any location data' },
                { value: 'specific', label: 'Specific locations' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLocationMode(opt.value as any)}
                  className={`p-2 border rounded-lg text-sm font-bold transition-all ${
                    locationMode === opt.value
                      ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {locationMode === 'specific' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Locations</label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto border p-2 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
                {availableLocations.length === 0 ? (
                  <span className="text-xs text-gray-400 p-1">No locations parsed in {currentYear} yet.</span>
                ) : (
                  availableLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => toggleSelection(loc, selectedLocations, setSelectedLocations)}
                      className={`px-2 py-1 text-xs rounded-md font-medium border transition-all ${
                        selectedLocations.includes(loc)
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {loc}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};