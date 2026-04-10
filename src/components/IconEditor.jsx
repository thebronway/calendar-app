import React, { useState, useMemo } from 'react';
import { Search, ArrowUp, ArrowDown } from 'lucide-react';
import { ICON_KEYS, ICON_COLOR_OPTIONS, ICON_MAP } from '../utils/constants';

const IconEditor = ({ isOpen, onClose, onSave, initialIconData }) => {
  const [iconType, setIconType] = useState(initialIconData?.value || initialIconData?.icon || ICON_KEYS[0]);
  const [iconColor, setIconColor] = useState(initialIconData?.color || initialIconData?.iconColor || ICON_COLOR_OPTIONS[0].class);
  const [iconSearch, setIconSearch] = useState('');
  const [iconSort, setIconSort] = useState('key');

  const filteredIcons = useMemo(() => {
    let filtered = ICON_KEYS;
    
    if (iconSearch.trim()) {
      const query = iconSearch.toLowerCase();
      filtered = filtered.filter(key => 
        key.toLowerCase().includes(query)
      );
    }
    
    return [...filtered].sort((a, b) => {
      switch (iconSort) {
        case 'a-z':
          return a.localeCompare(b);
        case 'z-a':
          return b.localeCompare(a);
        case 'key':
        default:
          return 0;
      }
    });
  }, [iconSearch, iconSort]);

  const handleSortChange = () => {
    const orders = ['key', 'a-z', 'z-a'];
    const currentIndex = orders.indexOf(iconSort);
    const nextIndex = (currentIndex + 1) % orders.length;
    setIconSort(orders[nextIndex]);
  };

  const handleSave = () => {
    onSave({ type: 'icon', value: iconType, color: iconColor });
    onClose();
  };
  const IconComponent = ICON_MAP[iconType];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[70] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl p-6 space-y-4">
        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-3">
          Select Icon and Color
        </h4>
        <div className="flex space-x-4 items-center">
          <div className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
            {IconComponent && iconType !== 'None' && (
              <IconComponent size={30} className={iconColor} />
            )}
          </div>
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Selected: {iconType}
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search icons..."
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSortChange}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            title={`Sort: ${iconSort === 'key' ? 'Key Order' : iconSort === 'a-z' ? 'A → Z' : 'Z → A'}`}
          >
            {iconSort === 'key' && <ArrowUp size={16} className="opacity-50" />}
            {iconSort === 'a-z' && <ArrowDown size={16} />}
            {iconSort === 'z-a' && <ArrowUp size={16} />}
            <span className="text-sm font-medium">
              {iconSort === 'key' ? 'Key' : iconSort === 'a-z' ? 'A-Z' : 'Z-A'}
            </span>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
          {filteredIcons.length > 0 ? (
            filteredIcons.map((key) => {
              const Icon = ICON_MAP[key];
              return (
                <button
                  key={key}
                  onClick={() => setIconType(key)}
                  className={`p-2 rounded-lg border transition-all ${iconType === key ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500' : 'bg-white dark:bg-gray-800 dark:border-gray-700'}`}
                >
                  {key === 'None' ? (
                    <span className="text-xs">None</span>
                  ) : (
                    <Icon size={20} className={iconColor} />
                  )}
                </button>
              );
            })
          ) : (
            <div className="w-full text-center py-4 text-gray-500 dark:text-gray-400">
              {iconSearch.trim() 
                ? `No icons match "${iconSearch}"`
                : 'No icons available'}
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          {filteredIcons.length} of {ICON_KEYS.length} icons
          {iconSearch.trim() && ` match "${iconSearch}"`}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {ICON_COLOR_OPTIONS.map((color) => (
            <button
              key={color.id}
              onClick={() => setIconColor(color.class)}
              className={`w-8 h-8 rounded-full ${color.bg} ${iconColor === color.class ? 'ring-2 ring-offset-2 ring-gray-900' : ''}`}
            />
          ))}
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded-lg">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default IconEditor;