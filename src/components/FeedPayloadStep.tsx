import React from 'react';
import { MapPin, AlignLeft, List as ListIcon, Tag } from 'lucide-react';
import { FilterButton } from './FilterButton';

export interface FeedPayloadStepProps {
  includeLocationField: boolean;
  setIncludeLocationField: (val: boolean) => void;
  selectedPayload: string[];
  setSelectedPayload: (val: string[]) => void;
}

export const FeedPayloadStep: React.FC<FeedPayloadStepProps> = ({
  includeLocationField,
  setIncludeLocationField,
  selectedPayload,
  setSelectedPayload,
}) => {
  const toggleSelection = (item: string) => {
    if (selectedPayload.includes(item)) {
      setSelectedPayload(selectedPayload.filter((i) => i !== item));
    } else {
      setSelectedPayload([...selectedPayload, item]);
    }
  };

  return (
    <div className="border dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/40 space-y-4">
      <div className="flex items-center space-x-2 border-b dark:border-gray-700 pb-2">
        <div className="bg-emerald-500 text-white font-black rounded-full w-5 h-5 flex items-center justify-center text-xs">2</div>
        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Calendar Event Details (What to include)</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location Field</label>
          <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800 border dark:border-gray-700 p-3 rounded-lg h-[88px] content-start">
            <FilterButton
              isSelected={includeLocationField}
              onClick={() => setIncludeLocationField(!includeLocationField)}
              className="w-full justify-center"
            >
              <MapPin size={14} className={includeLocationField ? 'text-white' : 'text-gray-400'} />
              <span>Location</span>
            </FilterButton>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Add to Event Notes</label>
          <div className="grid grid-cols-2 gap-2 bg-white dark:bg-gray-800 border dark:border-gray-700 p-3 rounded-lg min-h-[88px] content-start">
            <FilterButton isSelected={selectedPayload.includes('notes')} onClick={() => toggleSelection('notes')} className="justify-center">
              <AlignLeft size={14} />
              <span>Notes</span>
            </FilterButton>

            <FilterButton isSelected={selectedPayload.includes('activities')} onClick={() => toggleSelection('activities')} className="justify-center">
              <ListIcon size={14} />
              <span>Activities</span>
            </FilterButton>

            <FilterButton isSelected={selectedPayload.includes('categories')} onClick={() => toggleSelection('categories')} className="justify-center">
              <Tag size={14} />
              <span>Category</span>
            </FilterButton>

            <FilterButton isSelected={selectedPayload.includes('locations')} onClick={() => toggleSelection('locations')} className="justify-center">
              <MapPin size={14} />
              <span>Location</span>
            </FilterButton>
          </div>
        </div>
      </div>
    </div>
  );
};