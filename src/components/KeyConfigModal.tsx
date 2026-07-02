import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Key, ChevronLeft, ChevronRight, X, Palette, List, Loader,
  CalendarSearch, Plus, Search, Save, AlertCircle, CheckCircle, GripVertical
} from 'lucide-react';
import ToggleSwitch from './ToggleSwitch';
import IconEditor from './IconEditor';
import { CATEGORY_COLORS, ICON_COLOR_OPTIONS, ICON_MAP } from '../utils/constants';
import { useConfirm } from '../contexts/ConfirmContext';
import { usePreventTabClose } from '../hooks/useUnsavedChanges';
import { slugify } from '../utils/helpers';
import type { KeyItem } from '../types';

interface KeyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyItems: KeyItem[];
  onKeyItemsSave: (items: KeyItem[]) => void;
  year: number;
  onYearChange: (year: number) => void;
}

type TabId = 'categories' | 'activities';
type ImportStatus = 'idle' | 'loading' | 'success' | 'not-found' | 'error';

const KeyConfigModal: React.FC<KeyConfigModalProps> = ({
  isOpen,
  onClose,
  keyItems,
  onKeyItemsSave,
  year,
  onYearChange,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('categories');
  const [localKeyItems, setLocalKeyItems] = useState<KeyItem[]>(keyItems);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [showIconEditor, setShowIconEditor] = useState(false);
  const [editingIconId, setEditingIconId] = useState<string | null>(null);
  const [keyActivitySearch, setKeyActivitySearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocalKeyItems(keyItems);
      setImportStatus('idle');
    }
  }, [isOpen, keyItems]);

  const isDirty = JSON.stringify(localKeyItems) !== JSON.stringify(keyItems);
  const { confirm } = useConfirm();
  usePreventTabClose(isDirty);

  const handleClose = async () => {
    if (isDirty && !(await confirm())) return;
    onClose();
  };

  const categories = localKeyItems.filter((i) => i.isColorKey);
  const icons = localKeyItems.filter((i) => !i.isColorKey);

  const filteredKeyActivities = useMemo(() => {
    if (!keyActivitySearch.trim()) return icons;
    const query = keyActivitySearch.toLowerCase();
    return icons.filter((item) => (item.label || '').toLowerCase().includes(query));
  }, [icons, keyActivitySearch]);

  const scrollToBottom = () =>
    setTimeout(
      () => scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' }),
      100
    );

  const handleAddCategory = () => {
    if (categories.length >= 5) return;
    setLocalKeyItems((prev) => [
      ...prev,
      { id: `cat_${Date.now()}`, label: 'New Category', isColorKey: true, colorCode: 'orange', showCount: false, icon: 'None' },
    ]);
    scrollToBottom();
  };

  const handleAddIconItem = () => {
    setLocalKeyItems((prev) => [
      ...prev,
      { id: `icon_${Date.now()}`, label: 'New Activity', isColorKey: false, icon: 'Star', iconColor: ICON_COLOR_OPTIONS[0].class, showCount: false },
    ]);
    scrollToBottom();
  };

  const handleUpdateItem = (id: string, field: keyof KeyItem, value: KeyItem[keyof KeyItem]) =>
    setLocalKeyItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

  const handleDeleteItem = (id: string) =>
    setLocalKeyItems((prev) => prev.filter((item) => item.id !== id));

  const dragCatItem = useRef<number | null>(null);
  const dragCatOverItem = useRef<number | null>(null);
  
  const handleCatSort = () => {
    if (dragCatItem.current === null || dragCatOverItem.current === null) return;
    const _categories = [...categories];
    const dragged = _categories.splice(dragCatItem.current, 1)[0];
    _categories.splice(dragCatOverItem.current, 0, dragged);
    setLocalKeyItems([..._categories, ...icons]);
    dragCatItem.current = null;
    dragCatOverItem.current = null;
  };

  const dragActItem = useRef<number | null>(null);
  const dragActOverItem = useRef<number | null>(null);

  const handleActSort = () => {
    if (dragActItem.current === null || dragActOverItem.current === null) return;
    const _icons = [...icons];
    const dragged = _icons.splice(dragActItem.current, 1)[0];
    _icons.splice(dragActOverItem.current, 0, dragged);
    setLocalKeyItems([...categories, ..._icons]);
    dragActItem.current = null;
    dragActOverItem.current = null;
  };

  const handleIconEditClick = (id: string) => {
    setEditingIconId(id);
    setShowIconEditor(true);
  };

  const handleIconSaveFromEditor = (iconData: { type: 'icon'; value: string; color: string }) => {
    if (editingIconId) {
      handleUpdateItem(editingIconId, 'icon', iconData.value);
      handleUpdateItem(editingIconId, 'iconColor', iconData.color);
    }
    setShowIconEditor(false);
    setEditingIconId(null);
  };

  const handleSaveAll = () => {
    onKeyItemsSave(localKeyItems);
    onClose();
  };

  const importFromPreviousYear = async () => {
    setImportStatus('loading');
    try {
      const res = await fetch(`/api/data/${year - 1}`);
      if (res.ok) {
        const data = await res.json();
        if (data.keyItems && data.keyItems.length > 0) {
          const imported: KeyItem[] = data.keyItems.map((k: KeyItem) => ({ ...k, id: k.id + '_imp' }));
          setLocalKeyItems(imported);
          setImportStatus('success');
        } else {
          setImportStatus('not-found');
        }
      } else {
        setImportStatus('not-found');
      }
    } catch (e) {
      console.error('Import failed', e);
      setImportStatus('error');
    }
    // Auto-clear status after 4s
    setTimeout(() => setImportStatus('idle'), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden relative">
        <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 gap-4">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <Key size={24} className="mr-3 text-blue-500" /> Key Configuration
          </h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600 shadow-sm">
              <button onClick={() => onYearChange(year - 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg border-r dark:border-gray-600 text-gray-600 dark:text-gray-300">
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 font-bold text-lg text-gray-800 dark:text-gray-100">{year}</span>
              <button onClick={() => onYearChange(year + 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg border-l dark:border-gray-600 text-gray-600 dark:text-gray-300">
                <ChevronRight size={20} />
              </button>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex md:hidden border-b dark:border-gray-700 bg-white dark:bg-gray-800 px-6">
          {([{ id: 'categories', label: 'Categories', Icon: Palette, count: categories.length, max: 5 }, { id: 'activities', label: 'Activities', Icon: List, count: icons.length, max: null }] as const).map(({ id, label, Icon, count, max }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center py-4 px-6 border-b-2 font-medium transition-colors ${activeTab === id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
              <Icon size={18} className="mr-2" />
              {label}
              <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === id ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                {count}{max ? `/${max}` : ''}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900" ref={scrollContainerRef}>
          {localKeyItems.length === 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center mb-6">
              <p className="text-gray-700 dark:text-blue-100 mb-4">No key defined for {year} yet.</p>
              <button
                onClick={importFromPreviousYear}
                disabled={importStatus === 'loading'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center mx-auto hover:bg-blue-700 transition-colors"
              >
                {importStatus === 'loading' ? <Loader size={18} className="animate-spin mr-2" /> : <CalendarSearch size={18} className="mr-2" />}
                Import from {year - 1}
              </button>
              {importStatus === 'not-found' && (
                <p className="mt-3 text-sm text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1">
                  <AlertCircle size={14} /> No data found for {year - 1}.
                </p>
              )}
              {importStatus === 'error' && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
                  <AlertCircle size={14} /> Import failed. Please try again.
                </p>
              )}
            </div>
          )}

          {/* Import feedback banner (when items already exist) */}
          {localKeyItems.length > 0 && importStatus !== 'idle' && importStatus !== 'loading' && (
            <div className={`mb-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium ${importStatus === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'}`}>
              {importStatus === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {importStatus === 'success' && `Key imported from ${year - 1} successfully.`}
              {importStatus === 'not-found' && `No key data found for ${year - 1}.`}
              {importStatus === 'error' && 'Import failed. Please try again.'}
            </div>
          )}

          <div className={`${activeTab === 'categories' ? 'block' : 'hidden'} md:block max-w-4xl mx-auto space-y-6`}>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="hidden md:block text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Categories</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Categories color the background of the day cell.{' '}
                  <span className={`font-bold ${categories.length >= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'}`}>
                    ({categories.length}/5 used)
                  </span>
                </p>
              </div>
              <button onClick={handleAddCategory} disabled={categories.length >= 5} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus size={16} className="mr-2" /> Add
              </button>
            </div>
              <div className="grid gap-4">
                {categories.map((cat, index) => (
                  <div 
                    key={cat.id} 
                    draggable
                    onDragStart={() => (dragCatItem.current = index)}
                    onDragEnter={() => (dragCatOverItem.current = index)}
                    onDragEnd={handleCatSort}
                    onDragOver={(e) => e.preventDefault()}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-4 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="text-gray-400 shrink-0 hidden md:block" />
                    <div className="flex gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {CATEGORY_COLORS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleUpdateItem(cat.id, 'colorCode', c.id)}
                          className={`w-8 h-8 rounded-full ${c.bg} ${cat.colorCode === c.id ? 'ring-2 ring-offset-2 ring-gray-800 dark:ring-gray-200' : 'opacity-50 hover:opacity-100'}`}
                        />
                      ))}
                    </div>
                    <div className="flex-1 w-full min-w-0">
                      <input
                        type="text"
                        value={cat.label}
                        onChange={(e) => handleUpdateItem(cat.id, 'label', e.target.value)}
                        className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                        placeholder="Category Name"
                      />
                      {cat.label && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1 truncate" title={slugify(cat.label)}>
                          URL ID: <span className="font-mono">{slugify(cat.label)}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Count</span>
                      <ToggleSwitch checked={!!cat.showCount} onChange={() => handleUpdateItem(cat.id, 'showCount', !cat.showCount)} />
                    </div>
                    <div className="flex items-center space-x-1 border-l pl-2 dark:border-gray-700">
                      <button onClick={() => handleDeleteItem(cat.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <button onClick={handleAddCategory} disabled={categories.length >= 5} className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed border border-dashed border-blue-300 dark:border-blue-700">
                    <Plus size={16} className="mr-2" /> Add Category
                  </button>
                  {categories.length >= 5 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium text-center mt-2">
                      Maximum of 5 categories reached.
                    </p>
                  )}
                </div>
              </div>
            </div>

          <div className={`${activeTab === 'activities' ? 'block' : 'hidden'} md:block max-w-4xl mx-auto space-y-6 mt-8 md:mt-12`}>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="hidden md:block text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Activities</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Activities appear as small symbols on the day cell.</p>
              </div>
              <button onClick={handleAddIconItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
                <Plus size={16} className="mr-2" /> Add
              </button>
            </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={keyActivitySearch}
                  onChange={(e) => setKeyActivitySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-3">
                {filteredKeyActivities.length > 0 ? (
                  filteredKeyActivities.map((item) => {
                    const originalIndex = icons.findIndex((i) => i.id === item.id);
                    const IconC = item.icon ? ICON_MAP[item.icon] : null;
                    const displayColor = !item.iconColor || item.iconColor === 'none' ? 'text-gray-900 dark:text-gray-100' : item.iconColor;
                    return (
                      <div 
                        key={item.id} 
                        draggable
                        onDragStart={() => (dragActItem.current = originalIndex)}
                        onDragEnter={() => (dragActOverItem.current = originalIndex)}
                        onDragEnd={handleActSort}
                        onDragOver={(e) => e.preventDefault()}
                        className="bg-white dark:bg-gray-800 p-3 rounded-xl border dark:border-gray-700 shadow-sm flex items-center gap-4 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="text-gray-400 shrink-0 hidden md:block" />
                        <button onClick={() => handleIconEditClick(item.id)} className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border dark:border-gray-600 hover:bg-gray-200">
                          {IconC ? <IconC size={24} className={displayColor} /> : <span className="text-xs">None</span>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleUpdateItem(item.id, 'label', e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                            placeholder="Activity Name"
                          />
                          {item.label && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1 truncate" title={slugify(item.label)}>
                              URL ID: <span className="font-mono">{slugify(item.label)}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 border-l pl-4 dark:border-gray-700">
                          <span className="text-xs font-bold text-gray-500 uppercase">Count</span>
                          <ToggleSwitch checked={!!item.showCount} onChange={() => handleUpdateItem(item.id, 'showCount', !item.showCount)} />
                        </div>
                        <div className="flex items-center space-x-1 border-l pl-2 dark:border-gray-700">
                          <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    {keyActivitySearch.trim() ? `No activities match "${keyActivitySearch}"` : 'No activities defined yet. Add your first activity!'}
                  </div>
                )}
                {icons.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                    {filteredKeyActivities.length} of {icons.length} activities
                    {keyActivitySearch.trim() && ` match "${keyActivitySearch}"`}
                  </div>
                )}
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <button onClick={handleAddIconItem} className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-dashed border-blue-300 dark:border-blue-700">
                    <Plus size={16} className="mr-2" /> Add Activity
                  </button>
                </div>
              </div>
            </div>
        </div>

        <div className="p-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
          <button
            onClick={importFromPreviousYear}
            disabled={importStatus === 'loading'}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {importStatus === 'loading' ? <Loader size={14} className="animate-spin" /> : <CalendarSearch size={14} />}
            Import from {year - 1}
          </button>
          <div className="flex space-x-3">
            <button onClick={handleClose} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSaveAll} className="px-6 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 shadow-lg flex items-center">
              <Save size={18} className="mr-2" /> Save Key
            </button>
          </div>
        </div>
      </div>

      <IconEditor
        isOpen={showIconEditor}
        onClose={() => setShowIconEditor(false)}
        onSave={handleIconSaveFromEditor}
        initialIconData={
          editingIconId
            ? (() => {
                const item = localKeyItems.find((i) => i.id === editingIconId);
                return item ? { value: item.icon, color: item.iconColor } : null;
              })()
            : null
        }
      />
    </div>
  );
};

export default KeyConfigModal;
