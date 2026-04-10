import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Key, ChevronLeft, ChevronRight, X, Palette, List, Loader, CalendarSearch, Plus, ArrowUp, ArrowDown, Search, Save } from 'lucide-react';
import ToggleSwitch from './ToggleSwitch';
import IconEditor from './IconEditor';
import { CATEGORY_COLORS, ICON_COLOR_OPTIONS, ICON_MAP } from '../utils/constants';

const KeyConfigModal = ({ isOpen, onClose, keyItems, onKeyItemsSave, year, onYearChange }) => {
  const [activeTab, setActiveTab] = useState('categories');
  const [localKeyItems, setLocalKeyItems] = useState(keyItems);
  const scrollContainerRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    setLocalKeyItems(keyItems);
  }, [keyItems]);

  const categories = localKeyItems.filter((i) => i.isColorKey);
  const icons = localKeyItems.filter((i) => !i.isColorKey);

  // Icon Editor State
  const [showIconEditor, setShowIconEditor] = useState(false);
  const [editingIconId, setEditingIconId] = useState(null);

  // Activities search state
  const [keyActivitySearch, setKeyActivitySearch] = useState('');

  const filteredKeyActivities = useMemo(() => {
    if (!keyActivitySearch.trim()) {
      return icons;
    }
    
    const query = keyActivitySearch.toLowerCase();
    return icons.filter(item => 
      (item.label || '').toLowerCase().includes(query)
    );
  }, [icons, keyActivitySearch]);

  const handleAddCategory = () => {
    if (categories.length >= 5) return;
    setLocalKeyItems((prev) => [
      ...prev,
      {
        id: `cat_${Date.now()}`,
        label: 'New Category',
        isColorKey: true,
        colorCode: 'orange',
        showCount: false,
        icon: 'None',
      },
    ]);
    setTimeout(
      () =>
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        }),
      100
    );
  };

  const handleAddIconItem = () => {
    setLocalKeyItems((prev) => [
      ...prev,
      {
        id: `icon_${Date.now()}`,
        label: 'New Activity',
        isColorKey: false,
        icon: 'Star',
        iconColor: ICON_COLOR_OPTIONS[0].class,
        showCount: false,
      },
    ]);
    setTimeout(
      () =>
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        }),
      100
    );
  };

  const handleUpdateItem = (id, field, value) =>
    setLocalKeyItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  const handleDeleteItem = (id) =>
    setLocalKeyItems((prev) => prev.filter((item) => item.id !== id));

  const handleKeyMove = (index, direction, isCategory) => {
    const items = isCategory ? categories : icons;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const swapped = [...items];
    [swapped[index], swapped[newIndex]] = [swapped[newIndex], swapped[index]];
    setLocalKeyItems(isCategory ? [...swapped, ...icons] : [...categories, ...swapped]);
  };

  const handleIconEditClick = (id) => {
    setEditingIconId(id);
    setShowIconEditor(true);
  };
  const handleIconSaveFromEditor = (iconData) => {
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
    setIsImporting(true);
    try {
      const res = await fetch(`/api/data/${year - 1}`);
      if (res.ok) {
        const data = await res.json();
        if (data.keyItems && data.keyItems.length > 0) {
          const imported = data.keyItems.map((k) => ({ ...k, id: k.id + '_imp' }));
          setLocalKeyItems(imported);
        }
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    setIsImporting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 gap-4">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <Key size={24} className="mr-3 text-blue-500" /> Key Configuration
          </h3>

          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600 shadow-sm">
            <button
              onClick={() => onYearChange(year - 1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg border-r dark:border-gray-600 text-gray-600 dark:text-gray-300"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 font-bold text-lg text-gray-800 dark:text-gray-100">{year}</span>
            <button
              onClick={() => onYearChange(year + 1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg border-l dark:border-gray-600 text-gray-600 dark:text-gray-300"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b dark:border-gray-700 bg-white dark:bg-gray-800 px-6">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center py-4 px-6 border-b-2 font-medium transition-colors ${activeTab === 'categories' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            <Palette size={18} className="mr-2" /> Categories
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center py-4 px-6 border-b-2 font-medium transition-colors ${activeTab === 'activities' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            <List size={18} className="mr-2" /> Activities
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900"
          ref={scrollContainerRef}
        >
          {localKeyItems.length === 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center mb-6">
              <p className="text-gray-700 dark:text-blue-100 mb-4">
                No key defined for {year} yet.
              </p>
              <button
                onClick={importFromPreviousYear}
                disabled={isImporting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center mx-auto hover:bg-blue-700 transition-colors"
              >
                {isImporting ? (
                  <Loader size={18} className="animate-spin mr-2" />
                ) : (
                  <CalendarSearch size={18} className="mr-2" />
                )}
                Import from {year - 1}
              </button>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Categories color the background of the day cell. (Max 5)
                </p>
                <button
                  onClick={handleAddCategory}
                  disabled={categories.length >= 5}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center disabled:opacity-50"
                >
                  <Plus size={16} className="mr-2" /> Add
                </button>
              </div>
              <div className="grid gap-4">
                {categories.map((cat, index) => (
                  <div
                    key={cat.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-4"
                  >
                    <div className="flex gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {CATEGORY_COLORS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleUpdateItem(cat.id, 'colorCode', c.id)}
                          className={`w-8 h-8 rounded-full ${c.bg} ${cat.colorCode === c.id ? 'ring-2 ring-offset-2 ring-gray-800 dark:ring-gray-200' : 'opacity-50 hover:opacity-100'}`}
                        />
                      ))}
                    </div>
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        value={cat.label}
                        onChange={(e) => handleUpdateItem(cat.id, 'label', e.target.value)}
                        className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Count</span>
                      <ToggleSwitch
                      checked={cat.showCount}
                      onChange={() => handleUpdateItem(cat.id, 'showCount', !cat.showCount)}
                    />
                    </div>
                    <div className="flex items-center space-x-1 border-l pl-2 dark:border-gray-700">
                      <button
                        onClick={() => handleKeyMove(index, -1, true)}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => handleKeyMove(index, 1, true)}
                        disabled={index === categories.length - 1}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(cat.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
                
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <button
                    onClick={handleAddCategory}
                    disabled={categories.length >= 5}
                    className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed border border-dashed border-blue-300 dark:border-blue-700"
                  >
                    <Plus size={16} className="mr-2" /> Add Category
                  </button>
                  {categories.length >= 5 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                      Maximum 5 categories reached
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'activities' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Activities appear as small symbols on the day cell.
                </p>
                <button
                  onClick={handleAddIconItem}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center"
                >
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
                    const originalIndex = icons.findIndex(i => i.id === item.id);
                  const IconC = ICON_MAP[item.icon];
                  const displayColor =
                    !item.iconColor || item.iconColor === 'none'
                      ? 'text-gray-900 dark:text-gray-100'
                      : item.iconColor;
                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-gray-800 p-3 rounded-xl border dark:border-gray-700 shadow-sm flex items-center gap-4"
                    >
                      <button
                        onClick={() => handleIconEditClick(item.id)}
                        className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border dark:border-gray-600 hover:bg-gray-200"
                      >
                        {IconC ? (
                          <IconC size={24} className={displayColor} />
                        ) : (
                          <span className="text-xs">None</span>
                        )}
                      </button>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleUpdateItem(item.id, 'label', e.target.value)}
                          className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="flex items-center gap-2 border-l pl-4 dark:border-gray-700">
                        <span className="text-xs font-bold text-gray-500 uppercase">Count</span>
                        <ToggleSwitch
                        checked={item.showCount}
                        onChange={() => handleUpdateItem(item.id, 'showCount', !item.showCount)}
                      />
                      </div>
                      <div className="flex items-center space-x-1 border-l pl-2 dark:border-gray-700">
                        <button
                          onClick={() => handleKeyMove(originalIndex, -1, false)}
                          disabled={originalIndex === 0}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => handleKeyMove(originalIndex, 1, false)}
                          disabled={originalIndex === icons.length - 1}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-500 p-2 hover:bg-red-50 rounded-lg"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    {keyActivitySearch.trim() 
                      ? `No activities match "${keyActivitySearch}"`
                      : 'No activities defined yet. Add your first activity!'}
                  </div>
                )}
                
                {icons.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                    {filteredKeyActivities.length} of {icons.length} activities
                    {keyActivitySearch.trim() && ` match "${keyActivitySearch}"`}
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <button
                    onClick={handleAddIconItem}
                    className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-dashed border-blue-300 dark:border-blue-700"
                  >
                    <Plus size={16} className="mr-2" /> Add Activity
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAll}
            className="px-6 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 shadow-lg flex items-center"
          >
            <Save size={18} className="mr-2" /> Save Key
          </button>
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