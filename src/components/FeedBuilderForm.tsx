import React, { useState } from 'react';
import { FeedProfile } from '../hooks/useFeeds';
import { Settings, MapPin, Layers, Info, CheckSquare, Square } from 'lucide-react';
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
  
  // Step 1 State
  const [triggerType, setTriggerType] = useState<FeedProfile['triggerType']>(initialData?.triggerType || 'data');
  const [dataTriggerMode, setDataTriggerMode] = useState<FeedProfile['dataTriggerMode']>(initialData?.dataTriggerMode || 'categories');
  const [dataLogicalOperator, setDataLogicalOperator] = useState<FeedProfile['dataLogicalOperator']>(initialData?.dataLogicalOperator || 'OR');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.selectedCategories || []);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(initialData?.selectedActivities || []);
  const [locationMode, setLocationMode] = useState<FeedProfile['locationMode']>(initialData?.locationMode || 'any');
  const [selectedLocations, setSelectedLocations] = useState<string[]>(initialData?.selectedLocations || []);
  const [groupingMode, setGroupingMode] = useState<FeedProfile['groupingMode']>(initialData?.groupingMode || 'separate');

  // Step 2 State
  const [includeLocationField, setIncludeLocationField] = useState<boolean>(initialData?.includeLocationField ?? true);
  const [payloadActivities, setPayloadActivities] = useState<boolean>(initialData?.descriptionPayload?.activities ?? true);
  const [payloadCategories, setPayloadCategories] = useState<boolean>(initialData?.descriptionPayload?.categories ?? false);
  const [payloadNotes, setPayloadNotes] = useState<boolean>(initialData?.descriptionPayload?.notes ?? true);
  const [payloadLocations, setPayloadLocations] = useState<boolean>(initialData?.descriptionPayload?.locations ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialData?.id,
      token: initialData?.token,
      name: name.trim(),
      triggerType,
      dataTriggerMode,
      dataLogicalOperator,
      selectedCategories,
      selectedActivities,
      locationMode,
      selectedLocations,
      groupingMode,
      includeLocationField,
      descriptionPayload: {
        activities: payloadActivities,
        categories: payloadCategories,
        notes: payloadNotes,
        locations: payloadLocations,
      },
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
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
      {/* Feed Name */}
      <div>
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
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">The Event Trigger (What creates the block?)</h4>
        </div>

        {/* Trigger Type Selection */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTriggerType('data')}
            className={`p-2.5 border rounded-lg text-sm font-bold transition-all ${
              triggerType === 'data'
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
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
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
            }`}
          >
            Geographic Locations
          </button>
        </div>

        {/* PATH A: DATA TRIGGERS */}
        {triggerType === 'data' && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Trigger On</label>
              <select
                value={dataTriggerMode}
                onChange={(e) => setDataTriggerMode(e.target.value as any)}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm font-medium"
              >
                <option value="categories">Categories Only</option>
                <option value="activities">Activities Only</option>
                <option value="both">Both Categories & Activities</option>
              </select>
            </div>

            {dataTriggerMode === 'both' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Logic Rules</label>
                <select
                  value={dataLogicalOperator}
                  onChange={(e) => setDataLogicalOperator(e.target.value as any)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm font-medium"
                >
                  <option value="OR">Match Categories OR Activities (Any match triggers)</option>
                  <option value="AND">Match Categories AND Activities (Both must exist on day)</option>
                </select>
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
                          ? 'bg-gray-900 border-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                          : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
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
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto border p-2 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
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
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
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
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location Criteria</label>
              <select
                value={locationMode}
                onChange={(e) => setLocationMode(e.target.value as any)}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm font-medium"
              >
                <option value="any">Any Day Containing Any Location Data</option>
                <option value="specific">Limit to Specific Locations</option>
              </select>
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
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
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

        {/* Event Grouping/Splitting Logic */}
        <div className="pt-3 border-t dark:border-gray-700">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Grouping Strategy</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setGroupingMode('separate')}
              className={`p-2 border rounded-lg text-xs font-bold transition-all ${
                groupingMode === 'separate'
                  ? 'bg-purple-50 border-purple-400 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
                  : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
              }`}
            >
              Separate Events (e.g. 2 acts = 2 blocks)
            </button>
            <button
              type="button"
              onClick={() => setGroupingMode('combined')}
              className={`p-2 border rounded-lg text-xs font-bold transition-all ${
                groupingMode === 'combined'
                  ? 'bg-purple-50 border-purple-400 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
                  : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
              }`}
            >
              All-in-One Event (Combine items together)
            </button>
          </div>
        </div>
      </div>

      {/* --- STEP 2: THE PAYLOAD --- */}
      <div className="border dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/40 space-y-4">
        <div className="flex items-center space-x-2 border-b dark:border-gray-700 pb-2">
          <div className="bg-emerald-500 text-white font-black rounded-full w-5 h-5 flex items-center justify-center text-xs">2</div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">The Event Payload (Sub-categories & Details)</h4>
        </div>

        {/* Official iCal Location Field */}
        <label className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg cursor-pointer">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center">
            <MapPin size={14} className="mr-1.5 text-red-500" /> Map data to Location field
          </span>
          <input
            type="checkbox"
            checked={includeLocationField}
            onChange={(e) => setIncludeLocationField(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded"
          />
        </label>

        {/* Details Field Construction checklist */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Append to Details (Event Notes)</label>
          
          <div className="grid grid-cols-2 gap-2 bg-white dark:bg-gray-800 border dark:border-gray-700 p-3 rounded-lg">
            <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={payloadNotes} onChange={(e) => setPayloadNotes(e.target.checked)} className="rounded text-emerald-600" />
              <span>Rich-Text Notes</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={payloadActivities} onChange={(e) => setPayloadActivities(e.target.checked)} className="rounded text-emerald-600" />
              <span>List of Activities</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={payloadCategories} onChange={(e) => setPayloadCategories(e.target.checked)} className="rounded text-emerald-600" />
              <span>Category Display Name</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={payloadLocations} onChange={(e) => setPayloadLocations(e.target.checked)} className="rounded text-emerald-600" />
              <span>Location List</span>
            </label>
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