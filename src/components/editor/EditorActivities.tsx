import React, { useState, useMemo, useRef } from 'react';
import { X, Search, Pencil, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { ICON_MAP } from '../../utils/constants';
import type { KeyItem, IconEntry } from '../../types';

export type SortOrder = 'key' | 'a-z' | 'z-a';

interface EditorActivitiesProps {
  localIcons: IconEntry[];
  setLocalIcons: React.Dispatch<React.SetStateAction<IconEntry[]>>;
  availableActivities: KeyItem[];
  keyItems: KeyItem[];
}

export const EditorActivities: React.FC<EditorActivitiesProps> = ({ localIcons, setLocalIcons, availableActivities, keyItems }) => {
  const [activitySearch, setActivitySearch] = useState('');
  const [activitySort, setActivitySort] = useState<SortOrder>('key');
  const [editingIconIndex, setEditingIconIndex] = useState<number | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _localIcons = [...localIcons];
    const draggedItemContent = _localIcons.splice(dragItem.current, 1)[0];
    _localIcons.splice(dragOverItem.current, 0, draggedItemContent);
    setLocalIcons(_localIcons);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const filteredActivities = useMemo(() => {
    let filtered = availableActivities;
    if (activitySearch.trim()) {
      const query = activitySearch.toLowerCase();
      filtered = filtered.filter((item) => item.label.toLowerCase().includes(query));
    }
    return [...filtered].sort((a, b) => {
      if (activitySort === 'a-z') return a.label.localeCompare(b.label);
      if (activitySort === 'z-a') return b.label.localeCompare(a.label);
      return 0;
    });
  }, [availableActivities, activitySearch, activitySort]);

  const handleSortChange = () => {
    const orders: SortOrder[] = ['key', 'a-z', 'z-a'];
    setActivitySort(orders[(orders.indexOf(activitySort) + 1) % orders.length]);
  };

  const handleAddActivity = (keyItem: KeyItem) => {
    if (localIcons.length >= 4) return;
    setLocalIcons((prev) => [
      ...prev,
      { value: keyItem.icon, color: keyItem.iconColor ?? '' },
    ]);
  };

  const handleIconDelete = (index: number) =>
    setLocalIcons((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col flex-1 min-h-0 pt-6">
      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3 shrink-0">Activities</h4>
      <div className="flex flex-col flex-1 min-h-0 space-y-4">
        
        {/* Selected Activities */}
        <div className="space-y-2 shrink-0">
          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Selected</h5>
          {localIcons.length === 0 && (
            <p className="text-sm italic text-gray-500">No activities selected.</p>
          )}
          {localIcons.map((item, index) => {
            const iconValue = item.value || item.icon;
            const IconComponent = iconValue ? ICON_MAP[iconValue] : null;
            if (!IconComponent) return null;
            const keyDef = keyItems.find((k) => k.icon === iconValue && k.iconColor === item.color);
            const defaultLabel = keyDef ? keyDef.label : iconValue;
            const displayLabel = item.displayName || defaultLabel;

            return (
              <div 
                key={index} 
                draggable
                onDragStart={() => (dragItem.current = index)}
                onDragEnter={() => (dragOverItem.current = index)}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center justify-between p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0 pr-2">
                  <GripVertical size={16} className="text-gray-400 shrink-0" />
                  <IconComponent size={20} className={item.color + ' shrink-0'} />
                  {editingIconIndex === index ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="text"
                        value={item.displayName || ''}
                        onChange={(e) => {
                          const newIcons = [...localIcons];
                          newIcons[index] = { ...newIcons[index], displayName: e.target.value };
                          setLocalIcons(newIcons);
                        }}
                        placeholder={defaultLabel}
                        className="w-full text-sm p-1 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                        autoFocus
                        onBlur={() => {
                          const newIcons = [...localIcons];
                          newIcons[index] = { ...newIcons[index], displayName: item.displayName?.trim() === '' ? undefined : item.displayName };
                          setLocalIcons(newIcons);
                          setEditingIconIndex(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'Escape') {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium dark:text-gray-200 truncate" title={displayLabel}>
                        {displayLabel}
                      </span>
                      <button
                        onClick={() => {
                          setEditingIconIndex(index);
                        }}
                        className="text-gray-400 hover:text-blue-500 p-1 rounded shrink-0"
                      >
                        <Pencil size={14} />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  {editingIconIndex !== index && (
                    <button onClick={() => handleIconDelete(index)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded transition-colors">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Activity Section */}
        {localIcons.length < 4 && (
          <div className="flex flex-col flex-1 min-h-0 pt-4 border-t dark:border-gray-700">
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 shrink-0">Available</h5>
            <div className="flex gap-2 mb-3 shrink-0">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  disabled={localIcons.length >= 4}
                />
              </div>
              <button
                onClick={handleSortChange}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 shrink-0"
                disabled={localIcons.length >= 4}
              >
                {activitySort === 'key' && <ArrowUp size={14} className="opacity-50" />}
                {activitySort === 'a-z' && <ArrowDown size={14} />}
                {activitySort === 'z-a' && <ArrowUp size={14} />}
                <span className="hidden sm:inline">
                  {activitySort === 'key' ? 'Key' : activitySort === 'a-z' ? 'A-Z' : 'Z-A'}
                </span>
              </button>
            </div>
            
            {/* Scrolling list */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1">
              {filteredActivities.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {filteredActivities.map((keyItem) => {
                    const IconC = keyItem.icon ? ICON_MAP[keyItem.icon] : null;
                    const displayColor = !keyItem.iconColor || keyItem.iconColor === 'none' ? 'text-gray-900 dark:text-gray-100' : keyItem.iconColor;
                    return (
                      <button
                        key={keyItem.id}
                        onClick={() => handleAddActivity(keyItem)}
                        disabled={localIcons.length >= 4}
                        className="flex items-center p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-600 text-left disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {IconC && <IconC size={16} className={`${displayColor} mr-2 shrink-0`} />}
                        <span className="text-xs font-medium truncate dark:text-gray-200">{keyItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic p-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
                  {activitySearch.trim() ? `No activities match "${activitySearch}"` : 'No activities defined in Key. Go to Configure > Activities to add some.'}
                </div>
              )}
            </div>
            {availableActivities.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right mt-2 shrink-0">
                {filteredActivities.length} of {availableActivities.length} activities
                {activitySearch.trim() && ` match "${activitySearch}"`}
              </div>
            )}
          </div>
        )}
        {localIcons.length >= 4 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium pt-2 border-t dark:border-gray-700 shrink-0">
            Maximum of 4 activities reached. Remove one to add another.
          </p>
        )}
      </div>
    </div>
  );
};