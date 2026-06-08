import React, { useState } from 'react';
import { FeedProfile } from '../hooks/useFeeds';
import { MapPin, Info, AlignLeft, List as ListIcon, Tag } from 'lucide-react';
import { ICON_MAP } from '../utils/constants';

interface FeedBuilderFormProps {
  initialData?: FeedProfile | null;
  onSave: (feed: Omit<FeedProfile, 'token'> & { id?: string; token?: string }) => void;
  onCancel: () => void;
  // Pass down context data from current viewed year
  currentYear: number;
  availableCategories: Array<{ id: string; label: string }>;
  availableActivities: Array<{ icon: string; value: string; label: string; color?: string }>;
  availableLocations: string[];
}

export const FeedBuilderForm: React.FC<FeedBuilderFormProps> = ({
  initialData,
  onSave,
  onCancel,
  currentYear,
  availableCategories,
  availableActivities,
  availableLocations,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [isPublic, setIsPublic] = useState<boolean>(initialData?.isPublic || false);
  
  // Step 1 State
  const [triggerType, setTriggerType] = useState<FeedProfile['triggerType']>(initialData?.triggerType || 'data');
  const [dataTriggerMode, setDataTriggerMode] = useState<FeedProfile['dataTriggerMode']>(initialData?.dataTriggerMode || 'categories');
  const [dataLogicalOperator, setDataLogicalOperator] = useState<FeedProfile['dataLogicalOperator']>(initialData?.dataLogicalOperator || 'OR');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.selectedCategories || []);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(initialData?.selectedActivities || []);
  const [locationMode, setLocationMode] = useState<FeedProfile['locationMode']>(initialData?.locationMode || 'any');
  const [selectedLocations, setSelectedLocations] = useState<string[]>(initialData?.selectedLocations || []);

  // Step 2 State
  const [includeLocationField, setIncludeLocationField] = useState<boolean>(initialData?.includeLocationField ?? true);
  const [selectedPayload, setSelectedPayload] = useState<string[]>(
    Array.isArray(initialData?.descriptionPayload) ? initialData.descriptionPayload : []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialData?.id,
      token: initialData?.token,
      publicToken: initialData?.publicToken,
      isPublic,
      name: name.trim(),
      triggerType,
      dataTriggerMode,
      dataLogicalOperator,
      selectedCategories,
      selectedActivities,
      locationMode,
      selectedLocations,
      includeLocationField,
      descriptionPayload: selectedPayload,
    });
  };

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1 -mx-1 pr-2">
      {/* Feed Name & Visibility */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Feed Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., My Flights Feed, Commute Overview"
            className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="sm:w-48 shrink-0">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Visibility</label>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`w-full p-2.5 border rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              isPublic
                ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${isPublic ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isPublic ? 'Public Feed' : 'Private Feed'}
          </button>
        </div>
      </div>

      {/* Dynamic Data Warning Context Note */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3 rounded-lg flex items-start space-x-2.5">
        <Info size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 dark:text-amber-300">
          <strong>Note:</strong> The choices shown below are compiled directly from data present in your active <strong>{currentYear}</strong> calendar view.
        </p>
      </div>

      {/* --- STEP 1: THE TRIGGER --- */}
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

      {/* --- STEP 2: THE PAYLOAD --- */}
      <div className="border dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/40 space-y-4">
        <div className="flex items-center space-x-2 border-b dark:border-gray-700 pb-2">
          <div className="bg-emerald-500 text-white font-black rounded-full w-5 h-5 flex items-center justify-center text-xs">2</div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Calendar Event Details (What to include)</h4>
        </div>

        {/* Details Field Construction checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location Field</label>
            <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800 border dark:border-gray-700 p-3 rounded-lg h-[88px] content-start">
              <button
                type="button"
                onClick={() => setIncludeLocationField(!includeLocationField)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium border transition-all flex items-center gap-1.5 w-full justify-center ${
                  includeLocationField
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <MapPin size={14} className={includeLocationField ? 'text-white' : 'text-gray-400'} />
                <span>Map to Native Location Field</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Add to Event Notes</label>
            <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800 border dark:border-gray-700 p-3 rounded-lg min-h-[88px] content-start">
              <button
                type="button"
                onClick={() => toggleSelection('notes', selectedPayload, setSelectedPayload)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium border transition-all flex items-center gap-1.5 flex-1 justify-center ${
                  selectedPayload.includes('notes')
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <AlignLeft size={14} />
                <span>Notes</span>
              </button>

              <button
                type="button"
                onClick={() => toggleSelection('activities', selectedPayload, setSelectedPayload)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium border transition-all flex items-center gap-1.5 flex-1 justify-center ${
                  selectedPayload.includes('activities')
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <ListIcon size={14} />
                <span>Activities</span>
              </button>

              <button
                type="button"
                onClick={() => toggleSelection('categories', selectedPayload, setSelectedPayload)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium border transition-all flex items-center gap-1.5 flex-1 justify-center ${
                  selectedPayload.includes('categories')
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Tag size={14} />
                <span>Category</span>
              </button>

              <button
                type="button"
                onClick={() => toggleSelection('locations', selectedPayload, setSelectedPayload)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium border transition-all flex items-center gap-1.5 flex-1 justify-center ${
                  selectedPayload.includes('locations')
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <MapPin size={14} />
                <span>Location Tags</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footers */}
      <div className="flex justify-end space-x-2 pt-2 border-t dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Save Profile Rules
        </button>
      </div>
    </form>
  );
};