import React, { useState, useMemo, useRef } from 'react';
import { X, GripVertical, Plus, Search, ArrowUp, ArrowDown } from 'lucide-react';
import ToggleSwitch from '../ToggleSwitch';
import { ICON_MAP } from '../../utils/constants';
import { slugify } from '../../utils/helpers';
import type { KeyItem } from '../../types';

type SortOrder = 'key' | 'a-z' | 'z-a';

interface ActivityManagerProps {
  activities: KeyItem[];
  onUpdateItem: (id: string, field: keyof KeyItem, value: KeyItem[keyof KeyItem]) => void;
  onDeleteItem: (id: string) => void;
  onAddActivity: () => void;
  onEditIconClick: (id: string) => void;
  onReorder: (newActivities: KeyItem[]) => void;
}

const ActivityManager: React.FC<ActivityManagerProps> = ({
  activities,
  onUpdateItem,
  onDeleteItem,
  onAddActivity,
  onEditIconClick,
  onReorder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('key');

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _activities = [...activities];
    const dragged = _activities.splice(dragItem.current, 1)[0];
    _activities.splice(dragOverItem.current, 0, dragged);
    onReorder(_activities);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) {
      if (sortOrder === 'key') return activities;
      return [...activities].sort((a, b) => 
        sortOrder === 'a-z' ? (a.label || '').localeCompare(b.label || '') : (b.label || '').localeCompare(a.label || '')
      );
    }
    const query = searchQuery.toLowerCase();
    const filtered = activities.filter((item) => (item.label || '').toLowerCase().includes(query));
    
    return filtered.sort((a, b) => {
      if (sortOrder === 'a-z') return (a.label || '').localeCompare(b.label || '');
      if (sortOrder === 'z-a') return (b.label || '').localeCompare(a.label || '');
      return 0; // maintain key order if 'key'
    });
  }, [activities, searchQuery, sortOrder]);

  const handleSortChange = () => {
    const orders: SortOrder[] = ['key', 'a-z', 'z-a'];
    setSortOrder(orders[(orders.indexOf(sortOrder) + 1) % orders.length]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-8 md:mt-12">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="hidden md:block text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Activities</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">Activities appear as small symbols on the day cell.</p>
        </div>
        <button onClick={onAddActivity} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
          <Plus size={16} className="mr-2" /> Add
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search activities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-3">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((item) => {
            // Find its true index in the master list so drag/drop works even when filtered
            const originalIndex = activities.findIndex((i) => i.id === item.id);
            const IconC = item.icon ? ICON_MAP[item.icon] : null;
            const displayColor = !item.iconColor || item.iconColor === 'none' ? 'text-gray-900 dark:text-gray-100' : item.iconColor;
            
            return (
              <div 
                key={item.id} 
                draggable
                onDragStart={() => (dragItem.current = originalIndex)}
                onDragEnter={() => (dragOverItem.current = originalIndex)}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                className="bg-white dark:bg-gray-800 p-3 rounded-xl border dark:border-gray-700 shadow-sm flex items-center gap-4 cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="text-gray-400 shrink-0 hidden md:block" />
                <button 
                  onClick={() => onEditIconClick(item.id)} 
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border dark:border-gray-600 hover:bg-gray-200"
                >
                  {IconC ? <IconC size={24} className={displayColor} /> : <span className="text-xs">None</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => onUpdateItem(item.id, 'label', e.target.value)}
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
                  <ToggleSwitch checked={!!item.showCount} onChange={() => onUpdateItem(item.id, 'showCount', !item.showCount)} />
                </div>
                <div className="flex items-center space-x-1 border-l pl-2 dark:border-gray-700">
                  <button onClick={() => onDeleteItem(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                    <X size={18} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            {searchQuery.trim() ? `No activities match "${searchQuery}"` : 'No activities defined yet. Add your first activity!'}
          </div>
        )}
        
        {activities.length > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
            {filteredActivities.length} of {activities.length} activities
            {searchQuery.trim() && ` match "${searchQuery}"`}
          </div>
        )}

        <div className="mt-6 pt-6 border-t dark:border-gray-700">
          <button 
            onClick={onAddActivity} 
            className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-dashed border-blue-300 dark:border-blue-700"
          >
            <Plus size={16} className="mr-2" /> Add Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityManager;