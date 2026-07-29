import React, { useState, useEffect, useMemo, memo } from 'react';
import { X, Tag, MapPin } from 'lucide-react';
import { CATEGORY_COLORS, ICON_MAP, MONTHS } from '../utils/constants';
import { sanitizeHtml } from '../utils/helpers';
import { useConfirm } from '../contexts/ConfirmContext';
import { usePreventTabClose } from '../hooks/useUnsavedChanges';
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
  onSave: (data: Partial<DayData>, nextAction?: 'prev' | 'next' | 'close', bulkMask?: { category: boolean; activities: boolean; locations: boolean; notes: boolean }) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  isAdmin: boolean;
  keyItems: KeyItem[];
  isBulkEdit: boolean;
  bulkCount: number;
  hasFilters?: boolean;
  selectedDaysData?: Partial<DayData>[];
}

const CellEditor: React.FC<CellEditorProps> = memo(
  ({ isOpen, onClose, dayData, onSave, onNavigate, isAdmin, keyItems, isBulkEdit, bulkCount, hasFilters, selectedDaysData }) => {
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
        const isCustomHex = k.colorCode?.startsWith('#');
        const colorDef = CATEGORY_COLORS.find((c) => c.id === k.colorCode) || CATEGORY_COLORS[0];
        return {
          id: k.id,
          label: k.label,
          class: isCustomHex ? `text-gray-900 border-2 border-transparent` : `${colorDef.bg} text-gray-900 border-2 ${colorDef.border}`,
          bgClass: isCustomHex ? '' : colorDef.bg,
          customHex: isCustomHex ? k.colorCode : undefined,
        };
      });
      return [...defaults, ...cats];
    }, [categories]);

    const [localLocations, setLocalLocations] = useState('');
    const [localDetails, setLocalDetails] = useState('');
    const [localColorId, setLocalColorId] = useState('none');
    const [localIcons, setLocalIcons] = useState<IconEntry[]>([]);
    const [activeTab, setActiveTab] = useState<TabId>('cat_act');

    const [enableCategory, setEnableCategory] = useState(false);
    const [enableActivities, setEnableActivities] = useState(false);
    const [enableLocations, setEnableLocations] = useState(false);
    const [enableNotes, setEnableNotes] = useState(false);

    useEffect(() => {
      if (isOpen) {
        if (isBulkEdit && selectedDaysData && selectedDaysData.length > 0) {
          const first = selectedDaysData[0];
          let sharedLoc = first.locations || '';
          let sharedDet = first.details || '';
          let sharedCol = first.colorId || 'none';
          let sharedIcons = first.icons || [];
          
          let sameLoc = true, sameDet = true, sameCol = true, sameIcons = true;
          
          for (let i = 1; i < selectedDaysData.length; i++) {
            const d = selectedDaysData[i];
            if ((d.locations || '') !== sharedLoc) sameLoc = false;
            if ((d.details || '') !== sharedDet) sameDet = false;
            if ((d.colorId || 'none') !== sharedCol) sameCol = false;
            if (JSON.stringify(d.icons || []) !== JSON.stringify(sharedIcons)) sameIcons = false;
          }

          setLocalLocations(sameLoc ? sharedLoc : '');
          setLocalDetails(sameDet ? sharedDet : '');
          setLocalColorId(sameCol ? sharedCol : 'none');
          setLocalIcons(sameIcons ? sharedIcons : []);

          setEnableCategory(sameCol && sharedCol !== 'none');
          setEnableLocations(sameLoc && sharedLoc !== '');
          setEnableNotes(sameDet && sharedDet !== '');
          setEnableActivities(sameIcons && sharedIcons.length > 0);
          
          setActiveTab('cat_act');
        } else if (dayData && !isBulkEdit) {
          setLocalLocations(dayData.locations || '');
          setLocalDetails(dayData.details || '');
          setLocalColorId(dayData.colorId || 'none');
          setLocalIcons((dayData.icons as IconEntry[]) || []);
          setActiveTab('cat_act');
          
          setEnableCategory(false);
          setEnableActivities(false);
          setEnableLocations(false);
          setEnableNotes(false);
        }
      }
    }, [isOpen, dayData, isBulkEdit, selectedDaysData]);

    const dirtyState = useMemo(() => {
      if (!isAdmin || !dayData) return { isDirty: false, changedFields: [] as string[] };
      
      if (isBulkEdit) {
        const fields = [];
        if (enableCategory) fields.push('Category');
        if (enableActivities) fields.push('Activities');
        if (enableLocations) fields.push('Locations');
        if (enableNotes) fields.push('Notes');
        return { isDirty: fields.length > 0, changedFields: fields };
      }

      const changedFields: string[] = [];

      const safeLocs = (dayData.locations || '').trim();
      const localLocs = localLocations.trim();
      if (safeLocs !== localLocs) changedFields.push('Locations');

      if (localColorId !== (dayData.colorId || 'none')) changedFields.push('Category');

      // Safe icons check (ignoring strict object stringification order)
      const safeIcons = dayData.icons || [];
      let iconsChanged = localIcons.length !== safeIcons.length;
      if (!iconsChanged) {
        for (let i = 0; i < localIcons.length; i++) {
          const l = localIcons[i];
          const d = safeIcons[i];
          if ((l.value || l.icon) !== (d.value || d.icon) || l.color !== d.color || l.displayName !== d.displayName) {
            iconsChanged = true;
            break;
          }
        }
      }
      if (iconsChanged) changedFields.push('Activities');

      // Safe details check (Quill is notoriously noisy on mount with HTML structure)
      const dDet = dayData.details === '<p><br></p>' || !dayData.details ? '' : dayData.details;
      const lDet = localDetails === '<p><br></p>' || !localDetails ? '' : localDetails;
      
      if (lDet !== dDet) {
        // If strict equality fails, do a relaxed check. 
        const strip = (s: string) => s.replace(/<[^>]*>?/gm, '').replace(/\s+/g, '');
        if (strip(lDet) !== strip(dDet)) {
          changedFields.push('Notes');
        }
      }

      return { isDirty: changedFields.length > 0, changedFields };
    }, [isAdmin, dayData, localLocations, localDetails, localColorId, localIcons, isBulkEdit, enableCategory, enableActivities, enableLocations, enableNotes]);

    const { confirm } = useConfirm();
    usePreventTabClose(dirtyState.isDirty);

    const handleClose = async () => {
      if (dirtyState.isDirty && !(await confirm({
        title: 'Unsaved Changes',
        message: (
          <div>
            <p className="mb-2">You have unsaved changes in the following fields:</p>
            <ul className="list-disc pl-5 mb-3 font-semibold text-amber-600 dark:text-amber-500">
              {dirtyState.changedFields.map(f => <li key={f}>{f}</li>)}
            </ul>
            <p>Are you sure you want to discard them?</p>
          </div>
        )
      }))) return;
      onClose();
    };

    useEffect(() => {
      if (!isOpen || !dayData || isBulkEdit) return;

      const handleKeyDown = async (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          const direction = e.key === 'ArrowLeft' ? 'prev' : 'next';
          
          if (dirtyState.isDirty) {
            if (await confirm({ 
              title: 'Unsaved Changes',
              message: (
                <div>
                  <p className="mb-2">You have unsaved changes in the following fields:</p>
                  <ul className="list-disc pl-5 mb-3 font-semibold text-amber-600 dark:text-amber-500">
                    {dirtyState.changedFields.map(f => <li key={f}>{f}</li>)}
                  </ul>
                  <p>Discard them and move?</p>
                </div>
              )
            })) {
              onNavigate?.(direction);
            }
          } else {
            onNavigate?.(direction);
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, dayData, isBulkEdit, dirtyState, onNavigate]);

    const handleSave = async (nextAction?: 'prev' | 'next' | 'close') => {
      if (isBulkEdit) {
        // Interception check for overwriting existing non-blank data
        const overwrittenFields = new Set<string>();
        if (selectedDaysData) {
          for (const day of selectedDaysData) {
            if (enableCategory && day.colorId && day.colorId !== 'none' && day.colorId !== localColorId) overwrittenFields.add('Category');
            if (enableActivities && day.icons && day.icons.length > 0 && JSON.stringify(day.icons) !== JSON.stringify(localIcons)) overwrittenFields.add('Activities');
            if (enableLocations && day.locations && day.locations !== localLocations) overwrittenFields.add('Locations');
            
            const normDayDet = day.details === '<p><br></p>' ? '' : (day.details || '');
            const normLocDet = localDetails === '<p><br></p>' ? '' : localDetails;
            if (enableNotes && normDayDet && normDayDet !== normLocDet) overwrittenFields.add('Notes');
          }
        }

        if (overwrittenFields.size > 0) {
          const fieldsList = Array.from(overwrittenFields);
          if (!(await confirm({
            title: 'Overwrite Existing Data?',
            message: (
              <div>
                <p className="mb-2">You are about to overwrite existing data in the following fields across your selected days:</p>
                <ul className="list-disc pl-5 mb-3 font-semibold text-red-600 dark:text-red-400">
                  {fieldsList.map(f => <li key={f}>{f}</li>)}
                </ul>
                <p>Are you sure you want to proceed?</p>
              </div>
            ),
            confirmText: 'Overwrite',
          }))) {
            return;
          }
        }

        onSave(
          { ...dayData, locations: localLocations, details: localDetails, colorId: localColorId, icons: localIcons },
          nextAction,
          { category: enableCategory, activities: enableActivities, locations: enableLocations, notes: enableNotes }
        );
      } else {
        onSave({ ...dayData, locations: localLocations, details: localDetails, colorId: localColorId, icons: localIcons }, nextAction);
      }
    };

    const handleClearAll = async () => {
      if (await confirm({ 
        title: 'Clear Day', 
        message: 'Are you sure you want to clear all data for this day?', 
        confirmText: 'Clear Data' 
      })) {
        setLocalColorId('none');
        setLocalIcons([]);
        setLocalLocations('');
        setLocalDetails('');
      }
    };

    if (!isOpen || !dayData) return null;

    const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
      { id: 'cat_act', label: 'Categories & Activities', icon: Tag },
      { id: 'loc_notes', label: 'Locations & Notes', icon: MapPin },
    ];

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className={`bg-theme-panel text-theme-text border border-theme-item rounded-xl shadow-2xl w-full flex flex-col overflow-hidden ${isAdmin ? 'max-w-lg md:max-w-5xl max-h-[90vh] md:max-h-[85vh]' : 'max-w-lg max-h-[90vh]'}`}>
          <div className="flex justify-between items-center p-6 border-b border-theme-item bg-theme-item shrink-0">
            <h3 className="text-xl font-bold">
              {isBulkEdit ? (
                `Bulk Edit (${bulkCount} Days)`
              ) : (
                <>
                  {isAdmin ? 'Edit Day' : 'View Day'} - <span className="hidden sm:inline">{dateStrings.full} </span><span className="sm:hidden">{dateStrings.short} </span>{dayData.month} {dayData.day}, {dayData.year}
                </>
              )}
            </h3>
            <button onClick={handleClose} className="text-theme-text-secondary hover:text-theme-text transition-colors">
              <X size={24} />
            </button>
          </div>

          {isAdmin && (
            <div className="flex md:hidden justify-around bg-theme-base p-2 border-b border-theme-item shrink-0">
              {tabs.map((tab) => {
                const activeClass = activeTab === tab.id 
                  ? 'bg-theme-panel text-theme-accent shadow-sm' 
                  : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-item-hover';

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
                <div className="text-theme-text-secondary flex flex-wrap items-center gap-2">
                  <strong className="text-theme-text">Location(s):</strong>
                  {localLocations && localLocations.length > 0 ? (
                    localLocations.split(',').map((loc) => loc.trim()).filter(Boolean).map((location, index) => (
                      <span key={index} className="px-3 py-1 bg-theme-item border border-theme-grid-divider rounded-full text-sm font-bold text-theme-text break-words shadow-sm">
                        {location}
                      </span>
                    ))
                  ) : (
                    <span className="px-3 py-1 bg-theme-item border border-theme-grid-divider rounded-full text-sm font-bold text-theme-text shadow-sm">
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
                          <div key={index} className="flex items-center space-x-3 p-2 border border-theme-grid-divider rounded-lg bg-theme-item shadow-sm">
                            <IconComponent size={20} className={item.color?.startsWith('#') ? '' : item.color} style={{ color: item.color?.startsWith('#') ? item.color : undefined }} />
                            <span className="font-bold text-theme-text">
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
                    className="ql-editor prose prose-sm dark:prose-invert max-w-none mt-2 p-3 border border-theme-grid-divider rounded-lg bg-theme-item overflow-y-auto text-theme-text"
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
                    isBulkEdit={isBulkEdit}
                    bulkEnabled={enableCategory}
                    onBulkToggle={() => setEnableCategory(!enableCategory)}
                  />
                  <EditorActivities 
                    localIcons={localIcons} 
                    setLocalIcons={setLocalIcons} 
                    availableActivities={availableActivities} 
                    keyItems={keyItems} 
                    isBulkEdit={isBulkEdit}
                    bulkEnabled={enableActivities}
                    onBulkToggle={() => setEnableActivities(!enableActivities)}
                  />
                </div>
                <div className={`${activeTab === 'loc_notes' ? 'flex' : 'hidden'} md:flex flex-col space-y-6 h-full min-h-0`}>
                  <EditorLocations 
                    localLocations={localLocations} 
                    setLocalLocations={setLocalLocations} 
                    isBulkEdit={isBulkEdit}
                    bulkEnabled={enableLocations}
                    onBulkToggle={() => setEnableLocations(!enableLocations)}
                  />
                  <EditorNotes 
                    localDetails={localDetails} 
                    setLocalDetails={setLocalDetails} 
                    isBulkEdit={isBulkEdit}
                    bulkEnabled={enableNotes}
                    onBulkToggle={() => setEnableNotes(!enableNotes)}
                  />
                </div>
              </div>
            )}
          </div>

          <EditorFooter 
            isAdmin={isAdmin} 
            isBulkEdit={isBulkEdit} 
            onSave={handleSave} 
            onClose={handleClose} 
            onNavigate={onNavigate}
            onClearAll={isBulkEdit ? undefined : handleClearAll}
          />
        </div>
      </div>
    );
  }
);

CellEditor.displayName = 'CellEditor';

export default CellEditor;