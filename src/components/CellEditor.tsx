import React, { useState, useEffect, useMemo, memo } from 'react';
import { X, Tag, MapPin } from 'lucide-react';
import { CATEGORY_COLORS, ICON_MAP, MONTHS } from '../utils/constants';
import { sanitizeHtml } from '../utils/helpers';
import { useCloseGuard } from '../hooks/useUnsavedChanges';
import type { DayData, IconEntry, KeyItem } from '../types';

import { EditorCategories, CategoryOption } from './editor/EditorCategories';
import { EditorActivities } from './editor/EditorActivities';
import { EditorLocations } from './editor/EditorLocations';
import { EditorNotes } from './editor/EditorNotes';
import { EditorFooter } from './editor/EditorFooter';

type TabId = 'cat_act' | 'loc_notes';

interface CellEditorProps {
  isOpen: boolean;
  onClose: () => void;
  dayData: Partial<DayData> | null;
  onSave: (data: Partial<DayData>, nextAction?: 'prev' | 'next' | 'close') => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  isAdmin: boolean;
  keyItems: KeyItem[];
  isBulkEdit: boolean;
  bulkCount: number;
  hasFilters?: boolean;
}

const CellEditor: React.FC<CellEditorProps> = memo(
  ({ isOpen, onClose, dayData, onSave, onNavigate, isAdmin, keyItems, isBulkEdit, bulkCount, hasFilters }) => {
    const dateStrings = useMemo(() => {
      if (!dayData || isBulkEdit) return { full: '', short: '' };
      const mIndex = MONTHS.indexOf(dayData.month || '');
      if (mIndex === -1) return { full: '', short: '' };
      const dateObj = new Date(dayData.year || new Date().getFullYear(), mIndex, dayData.day || 1);
      return {
        full: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
        short: dateObj.toLocaleDateString('en-US', { weekday: 'short' })
      };
    }, [dayData, isBulkEdit]);

    const categories = useMemo(() => keyItems.filter((k) => k.isColorKey), [keyItems]);
    const availableActivities = useMemo(() => keyItems.filter((k) => !k.isColorKey && k.icon !== 'None'), [keyItems]);

    const categoryOptions = useMemo((): CategoryOption[] => {
      const defaults: CategoryOption[] = [{ id: 'none', label: 'Home', class: '', bgClass: 'bg-gray-300 dark:bg-gray-600' }];
      const cats = categories.map((k) => {
        const colorDef = CATEGORY_COLORS.find((c) => c.id === k.colorCode) || CATEGORY_COLORS[0];
        return {
          id: k.id,
          label: k.label,
          class: `${colorDef.bg} text-gray-900 border-2 ${colorDef.border}`,
          bgClass: colorDef.bg,
        };
      });
      return [...defaults, ...cats];
    }, [categories]);

    const [localLocations, setLocalLocations] = useState('');
    const [localDetails, setLocalDetails] = useState('');
    const [localColorId, setLocalColorId] = useState('none');
    const [localIcons, setLocalIcons] = useState<IconEntry[]>([]);
    const [activeTab, setActiveTab] = useState<TabId>('cat_act');

    useEffect(() => {
      if (isOpen && dayData) {
        setLocalLocations(dayData.locations || '');
        setLocalDetails(dayData.details || '');
        setLocalColorId(dayData.colorId || 'none');
        setLocalIcons((dayData.icons as IconEntry[]) || []);
        setActiveTab('cat_act');
      }
    }, [isOpen, dayData]);

    const isDirty = useMemo(() => {
      if (!isAdmin || !dayData) return false;
      
      // Quill rich text editor defaults empty content to "<p><br></p>"
      const normalizedLocalDetails = localDetails === '<p><br></p>' ? '' : localDetails;
      const normalizedDayDetails = dayData.details === '<p><br></p>' ? '' : (dayData.details || '');

      return (
        localLocations !== (dayData.locations || '') ||
        normalizedLocalDetails !== normalizedDayDetails ||
        localColorId !== (dayData.colorId || 'none') ||
        JSON.stringify(localIcons) !== JSON.stringify((dayData.icons as IconEntry[]) || [])
      );
    }, [isAdmin, dayData, localLocations, localDetails, localColorId, localIcons]);

    const guardedClose = useCloseGuard(isDirty, onClose);

    useEffect(() => {
      if (!isOpen || !dayData || isBulkEdit) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          const direction = e.key === 'ArrowLeft' ? 'prev' : 'next';
          
          if (isDirty) {
            if (window.confirm('You have unsaved changes. Discard them and move?')) {
              onNavigate?.(direction);
            }
          } else {
            onNavigate?.(direction);
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, dayData, isBulkEdit, isDirty, onNavigate]);

    const handleSave = (nextAction?: 'prev' | 'next' | 'close') => {
      onSave({ ...dayData, locations: localLocations, details: localDetails, colorId: localColorId, icons: localIcons }, nextAction);
    };

    if (!isOpen || !dayData) return null;

    const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
      { id: 'cat_act', label: 'Categories & Activities', icon: Tag },
      { id: 'loc_notes', label: 'Locations & Notes', icon: MapPin },
    ];

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full flex flex-col overflow-hidden ${isAdmin ? 'max-w-lg md:max-w-5xl max-h-[90vh] md:max-h-[85vh]' : 'max-w-lg max-h-[90vh]'}`}>
          <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 shrink-0">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {isBulkEdit ? (
                `Bulk Edit (${bulkCount} Days)`
              ) : (
                <>
                  {isAdmin ? 'Edit Day' : 'View Day'} - <span className="hidden sm:inline">{dateStrings.full} </span><span className="sm:hidden">{dateStrings.short} </span>{dayData.month} {dayData.day}, {dayData.year}
                </>
              )}
            </h3>
            <button onClick={guardedClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          {isAdmin && (
            <div className="flex md:hidden justify-around bg-gray-100 dark:bg-gray-900 p-2 border-b dark:border-gray-700 shrink-0">
              {tabs.map((tab) => {
                const activeClass = activeTab === tab.id 
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800';

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex justify-center items-center px-3 py-2 rounded-lg text-sm font-medium transition-all mx-1 ${activeClass}`}
                  >
                    <tab.icon size={16} className="mr-1.5 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="p-6 flex-1 overflow-y-auto min-h-0 flex flex-col">
            {hasFilters && isAdmin && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-2">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">
                  You are currently editing a filtered view. Icons that do not match the active URL filters will be hidden visually upon save.
                </p>
              </div>
            )}
            {!isAdmin ? (
              <div className="space-y-4">
                <div className="text-gray-700 dark:text-gray-300 flex flex-wrap items-center gap-2">
                  <strong>Location(s):</strong>
                  {localLocations && localLocations.length > 0 ? (
                    localLocations.split(',').map((loc) => loc.trim()).filter(Boolean).map((location, index) => (
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
                {localDetails && localDetails.replace(/<[^>]*>?/gm, '').trim() !== '' && (
                  <div
                    className="ql-editor prose prose-sm dark:prose-invert max-w-none mt-2 p-3 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-y-auto"
                    style={{ maxHeight: '150px' }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(localDetails) }}
                  />
                )}
              </div>
            ) : (
              <div className="md:grid md:grid-cols-2 md:gap-8 h-full min-h-0 flex-1">
                
                <div className={`${activeTab === 'cat_act' ? 'flex' : 'hidden'} md:flex flex-col space-y-6 h-full min-h-0`}>
                  <EditorCategories 
                    categories={categoryOptions} 
                    selectedId={localColorId} 
                    onSelect={setLocalColorId} 
                  />
                  <EditorActivities 
                    localIcons={localIcons} 
                    setLocalIcons={setLocalIcons} 
                    availableActivities={availableActivities} 
                    keyItems={keyItems} 
                  />
                </div>
                <div className={`${activeTab === 'loc_notes' ? 'flex' : 'hidden'} md:flex flex-col space-y-6 h-full min-h-0`}>
                  <EditorLocations 
                    localLocations={localLocations} 
                    setLocalLocations={setLocalLocations} 
                  />
                  <EditorNotes 
                    localDetails={localDetails} 
                    setLocalDetails={setLocalDetails} 
                  />
                </div>
              </div>
            )}
          </div>

          <EditorFooter 
            isAdmin={isAdmin} 
            isBulkEdit={isBulkEdit} 
            onSave={handleSave} 
            onClose={guardedClose} 
            onNavigate={onNavigate}
          />
        </div>
      </div>
    );
  }
);

CellEditor.displayName = 'CellEditor';

export default CellEditor;