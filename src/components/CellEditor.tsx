import React, { useState, useEffect, useMemo, memo } from 'react';
import ReactQuill from 'react-quill';
import { X, Tag, Activity, MapPin, Check, ArrowUp, ArrowDown, Search, Save, Pencil } from 'lucide-react';
import { CATEGORY_COLORS, ICON_MAP, QUILL_MODULES } from '../utils/constants';
import { sanitizeHtml } from '../utils/helpers';
import { useCloseGuard } from '../hooks/useUnsavedChanges';
import type { DayData, IconEntry, KeyItem } from '../types';

type SortOrder = 'key' | 'a-z' | 'z-a';
type TabId = 'category' | 'activities' | 'location';

interface CategoryOption {
  id: string;
  label: string;
  class: string;
}

interface CellEditorProps {
  isOpen: boolean;
  onClose: () => void;
  dayData: Partial<DayData> | null;
  onSave: (data: Partial<DayData>) => void;
  isAdmin: boolean;
  keyItems: KeyItem[];
  isBulkEdit: boolean;
  bulkCount: number;
}

const CellEditor: React.FC<CellEditorProps> = memo(
  ({ isOpen, onClose, dayData, onSave, isAdmin, keyItems, isBulkEdit, bulkCount }) => {
    const categories = useMemo(() => keyItems.filter((k) => k.isColorKey), [keyItems]);
    const availableActivities = useMemo(
      () => keyItems.filter((k) => !k.isColorKey && k.icon !== 'None'),
      [keyItems]
    );

    const categoryOptions = useMemo((): CategoryOption[] => {
      const defaults: CategoryOption[] = [
        {
          id: 'none',
          label: 'Home',
          class: 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700',
        },
      ];
      const cats = categories.map((k) => {
        const colorDef = CATEGORY_COLORS.find((c) => c.id === k.colorCode) || CATEGORY_COLORS[0];
        return {
          id: k.id,
          label: k.label,
          class: `${colorDef.bg} text-gray-900 border-2 ${colorDef.border}`,
        };
      });
      return [...defaults, ...cats];
    }, [categories]);

    const [localLocations, setLocalLocations] = useState('');
    const [localDetails, setLocalDetails] = useState('');
    const [localColorId, setLocalColorId] = useState('none');
    const [localIcons, setLocalIcons] = useState<IconEntry[]>([]);
    const [activeTab, setActiveTab] = useState<TabId>('category');
    const [activitySearch, setActivitySearch] = useState('');
    const [activitySort, setActivitySort] = useState<SortOrder>('key');
    const [editingIconIndex, setEditingIconIndex] = useState<number | null>(null);
    const [editingIconName, setEditingIconName] = useState<string>('');

    useEffect(() => {
      if (isOpen && dayData) {
        setLocalLocations(dayData.locations || '');
        setLocalDetails(dayData.details || '');
        setLocalColorId(dayData.colorId || 'none');
        setLocalIcons((dayData.icons as IconEntry[]) || []);
        setActiveTab('category');
        setActivitySearch('');
        setEditingIconIndex(null);
        setEditingIconName('');
      }
    }, [isOpen, dayData]);

    // Track unsaved changes (only in admin edit mode)
    const isDirty = useMemo(() => {
      if (!isAdmin || !dayData) return false;
      return (
        localLocations !== (dayData.locations || '') ||
        localDetails !== (dayData.details || '') ||
        localColorId !== (dayData.colorId || 'none') ||
        JSON.stringify(localIcons) !== JSON.stringify((dayData.icons as IconEntry[]) || [])
      );
    }, [isAdmin, dayData, localLocations, localDetails, localColorId, localIcons]);

    const guardedClose = useCloseGuard(isDirty, onClose);

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

    const handleSave = () => {
      onSave({ ...dayData, locations: localLocations, details: localDetails, colorId: localColorId, icons: localIcons });
      onClose();
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

    const handleIconMove = (index: number, direction: number) => {
      const newIcons = [...localIcons];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= newIcons.length) return;
      [newIcons[index], newIcons[newIndex]] = [newIcons[newIndex], newIcons[index]];
      setLocalIcons(newIcons);
    };

    if (!isOpen || !dayData) return null;

    const tabs: { id: TabId; label: string; desktopLabel?: string; hiddenMd?: boolean; icon: React.ElementType }[] = [
      { id: 'category', label: 'Category', desktopLabel: 'Category & Activities', icon: Tag },
      { id: 'activities', label: 'Activities', hiddenMd: true, icon: Activity },
      { id: 'location', label: 'Location & Notes', icon: MapPin },
    ];

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
          <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {isBulkEdit
                ? `Bulk Edit (${bulkCount} Days)`
                : `${isAdmin ? 'Edit Day' : 'View Day'} - ${dayData.month} ${dayData.day}, ${dayData.year}`}
            </h3>
            <button onClick={guardedClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          {isAdmin && (
            <div className="flex justify-around bg-gray-100 dark:bg-gray-900 p-2 border-b dark:border-gray-700">
              {tabs.map((tab) => {
                let activeClass = '';
                if (tab.id === 'category') {
                  activeClass = activeTab === 'category' 
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow' 
                    : activeTab === 'activities'
                      ? 'md:bg-white md:dark:bg-gray-700 md:text-blue-600 md:dark:text-blue-400 md:shadow text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800';
                } else {
                  activeClass = activeTab === tab.id 
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800';
                }

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${tab.hiddenMd ? 'md:hidden' : ''} ${activeClass}`}
                  >
                    <tab.icon size={16} className="mr-1.5" />
                    <span className="md:hidden">{tab.label}</span>
                    <span className="hidden md:inline">{tab.desktopLabel || tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {!isAdmin ? (
              <div className="space-y-4">
                <div className="text-gray-700 dark:text-gray-300 flex flex-wrap items-center gap-2">
                  <strong>Location(s):</strong>
                  {localLocations && localLocations.length > 0 ? (
                    localLocations
                      .split(',')
                      .map((loc) => loc.trim())
                      .filter(Boolean)
                      .map((location, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-800 dark:text-gray-200 break-words">
                          {location}
                        </span>
                      ))
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-800 dark:text-gray-200">
                      Home
                    </span>
                  )}
                </div>
                {localIcons.length > 0 && (
                  <div className="space-y-2">
                    {localIcons.map((item, index) => {
                      const iconValue = item.value || item.icon;
                      if (iconValue && iconValue !== 'None' && ICON_MAP[iconValue]) {
                        const IconComponent = ICON_MAP[iconValue]!;
                        const keyItem = keyItems.find((k) => k.icon === iconValue && k.iconColor === item.color);
                        return (
                          <div key={index} className="flex items-center space-x-3 p-2 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                            <IconComponent size={20} className={item.color} />
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {item.displayName || (keyItem ? keyItem.label : iconValue)}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
                {localDetails && (
                  <div
                    className="ql-editor prose prose-sm dark:prose-invert max-w-none mt-2 p-3 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-y-auto"
                    style={{ maxHeight: '150px' }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(localDetails) }}
                  />
                )}
              </div>
            ) : (
              <>
                <div className={`${activeTab === 'category' ? 'block' : 'hidden'} ${(activeTab === 'category' || activeTab === 'activities') ? 'md:block' : 'md:hidden'} space-y-4`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 md:hidden">Select a category for this day:</p>
                  <h4 className="hidden md:block text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-2">Category</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {categoryOptions.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setLocalColorId(color.id)}
                        className={`flex items-center p-3 rounded-lg border transition-all ${color.class} ${localColorId === color.id ? 'ring-4 ring-blue-500 ring-offset-2' : 'border-transparent'}`}
                      >
                        <div className="flex-1 text-left font-bold">{color.label}</div>
                        {localColorId === color.id && <Check size={20} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`${activeTab === 'activities' ? 'block' : 'hidden'} ${(activeTab === 'category' || activeTab === 'activities') ? 'md:block' : 'md:hidden'} space-y-6 md:pt-6 md:border-t md:dark:border-gray-700`}>
                  <h4 className="hidden md:block text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-2">Activities</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Selected</h4>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {localIcons.length} / 4
                        </span>
                      </div>
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
                          <div key={index} className="flex items-center justify-between p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                            <div className="flex items-center space-x-2 flex-1 min-w-0 pr-2">
                              <IconComponent size={20} className={item.color + ' shrink-0'} />
                              {editingIconIndex === index ? (
                                <div className="flex items-center space-x-2 flex-1">
                                  <input
                                    type="text"
                                    value={editingIconName}
                                    onChange={(e) => setEditingIconName(e.target.value)}
                                    placeholder={defaultLabel}
                                    className="w-full text-sm p-1 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const newIcons = [...localIcons];
                                        newIcons[index].displayName = editingIconName.trim() === '' ? undefined : editingIconName;
                                        setLocalIcons(newIcons);
                                        setEditingIconIndex(null);
                                      } else if (e.key === 'Escape') {
                                        setEditingIconIndex(null);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      const newIcons = [...localIcons];
                                      newIcons[index].displayName = editingIconName.trim() === '' ? undefined : editingIconName;
                                      setLocalIcons(newIcons);
                                      setEditingIconIndex(null);
                                    }}
                                    className="text-green-500 hover:bg-green-50 p-1 rounded shrink-0"
                                  >
                                    <Check size={16} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm font-medium dark:text-gray-200 truncate" title={displayLabel}>
                                    {displayLabel}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingIconIndex(index);
                                      setEditingIconName(item.displayName || '');
                                    }}
                                    className="text-gray-400 hover:text-blue-500 p-1 rounded shrink-0"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 shrink-0">
                              <button onClick={() => handleIconMove(index, -1)} disabled={index === 0} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                <ArrowUp size={16} />
                              </button>
                              <button onClick={() => handleIconMove(index, 1)} disabled={index === localIcons.length - 1} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                <ArrowDown size={16} />
                              </button>
                              <button onClick={() => handleIconDelete(index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {localIcons.length < 4 && (
                      <div className="space-y-2 pt-4 border-t dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Add Activity</h4>
                          <div className="text-xs text-gray-500">{localIcons.length}/4 used</div>
                        </div>
                        <div className="flex gap-2">
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
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5"
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
                        {filteredActivities.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                            {filteredActivities.map((keyItem) => {
                              const IconC = keyItem.icon ? ICON_MAP[keyItem.icon] : null;
                              const displayColor = !keyItem.iconColor || keyItem.iconColor === 'none' ? 'text-gray-900 dark:text-gray-100' : keyItem.iconColor;
                              return (
                                <button
                                  key={keyItem.id}
                                  onClick={() => handleAddActivity(keyItem)}
                                  disabled={localIcons.length >= 4}
                                  className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border dark:border-gray-600 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {IconC && <IconC size={16} className={`${displayColor} mr-2`} />}
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
                        {availableActivities.length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                            {filteredActivities.length} of {availableActivities.length} activities
                            {activitySearch.trim() && ` match "${activitySearch}"`}
                          </div>
                        )}
                      </div>
                    )}
                    {localIcons.length >= 4 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium pt-2 border-t dark:border-gray-700">
                        Maximum of 4 activities reached. Remove one to add another.
                      </p>
                    )}
                  </div>

                {activeTab === 'location' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Location(s) (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={localLocations}
                        onChange={(e) => setLocalLocations(e.target.value)}
                        className="w-full border rounded-lg p-2 font-bold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g. NYC, London"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                      <ReactQuill
                        theme="snow"
                        value={localDetails}
                        onChange={setLocalDetails}
                        modules={QUILL_MODULES}
                        className="quill-editor-custom"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-end space-x-3">
            {isAdmin && (
              <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                <Save size={18} className="mr-2" /> Save
              </button>
            )}
            {!isAdmin && (
              <button onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg">
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

CellEditor.displayName = 'CellEditor';

export default CellEditor;
