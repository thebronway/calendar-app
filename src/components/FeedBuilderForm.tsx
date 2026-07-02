import React, { useState } from 'react';
import { FeedProfile } from '../hooks/useFeeds';
import { Info, Save } from 'lucide-react';
import { FeedTriggerStep } from './FeedTriggerStep';
import { FeedPayloadStep } from './FeedPayloadStep';

interface FeedBuilderFormProps {
  initialData?: FeedProfile | null;
  onSave: (feed: Omit<FeedProfile, 'token'> & { id?: string; token?: string }) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
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
  onDirtyChange,
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

  React.useEffect(() => {
    if (!onDirtyChange) return;

    const currentState = {
      name,
      isPublic,
      triggerType,
      dataTriggerMode,
      dataLogicalOperator,
      selectedCategories,
      selectedActivities,
      locationMode,
      selectedLocations,
      includeLocationField,
      descriptionPayload: selectedPayload,
    };

    const initialState = {
      name: initialData?.name || '',
      isPublic: initialData?.isPublic || false,
      triggerType: initialData?.triggerType || 'data',
      dataTriggerMode: initialData?.dataTriggerMode || 'categories',
      dataLogicalOperator: initialData?.dataLogicalOperator || 'OR',
      selectedCategories: initialData?.selectedCategories || [],
      selectedActivities: initialData?.selectedActivities || [],
      locationMode: initialData?.locationMode || 'any',
      selectedLocations: initialData?.selectedLocations || [],
      includeLocationField: initialData?.includeLocationField ?? true,
      descriptionPayload: Array.isArray(initialData?.descriptionPayload) ? initialData.descriptionPayload : [],
    };

    const isDirty = JSON.stringify(currentState) !== JSON.stringify(initialState);
    onDirtyChange(isDirty);
  }, [
    name, isPublic, triggerType, dataTriggerMode, dataLogicalOperator,
    selectedCategories, selectedActivities, locationMode, selectedLocations,
    includeLocationField, selectedPayload, initialData, onDirtyChange
  ]);

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
    <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
      <FeedTriggerStep
        triggerType={triggerType}
        setTriggerType={setTriggerType}
        dataTriggerMode={dataTriggerMode}
        setDataTriggerMode={setDataTriggerMode}
        dataLogicalOperator={dataLogicalOperator}
        setDataLogicalOperator={setDataLogicalOperator}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedActivities={selectedActivities}
        setSelectedActivities={setSelectedActivities}
        locationMode={locationMode}
        setLocationMode={setLocationMode}
        selectedLocations={selectedLocations}
        setSelectedLocations={setSelectedLocations}
        availableCategories={availableCategories}
        availableActivities={availableActivities}
        availableLocations={availableLocations}
        currentYear={currentYear}
      />

      {/* --- STEP 2: THE PAYLOAD --- */}
      <FeedPayloadStep
        includeLocationField={includeLocationField}
        setIncludeLocationField={setIncludeLocationField}
        selectedPayload={selectedPayload}
        setSelectedPayload={setSelectedPayload}
      />
      </div>

      {/* Action Footers */}
      <div className="p-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end space-x-3 shrink-0 rounded-b-xl">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 shadow-lg flex items-center transition-colors"
        >
          <Save size={18} className="mr-2" /> Save Feed
        </button>
      </div>
    </form>
  );
};