import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import { 
    Plane, Car, Train, Activity, Mountain, Music, Flag, Heart, Calendar, CalendarDays, Lock, 
    User, Check, Edit, Save, Plus, X, Footprints, Bike, Palette, AlertTriangle, CloudOff, Loader,
    Hotel, Map, Globe, Anchor, Ticket, Tent, Home, Truck, Users, Briefcase, ChevronLeft, ChevronRight, Gift,
    LogIn, LogOut, ArrowUp, ArrowDown, Moon, Sun, Settings, ChevronDown, ChevronUp, Github, Database,
    Layout, List, Image as ImageIcon, MapPin, Tag
} from 'lucide-react';

// --- Available Colors ---
const CATEGORY_COLORS = [
    { id: 'orange', label: 'Orange', bg: 'bg-orange-400', border: 'border-orange-500' },
    { id: 'blue', label: 'Blue', bg: 'bg-blue-400', border: 'border-blue-500' },
    { id: 'green', label: 'Green', bg: 'bg-emerald-400', border: 'border-emerald-500' },
    { id: 'purple', label: 'Purple', bg: 'bg-purple-400', border: 'border-purple-500' },
    { id: 'red', label: 'Red', bg: 'bg-rose-400', border: 'border-rose-500' },
];

const ICON_COLOR_OPTIONS = [
    { id: 'gray', class: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-900 dark:bg-gray-100', label: 'Black/Gray' },
    { id: 'red', class: 'text-red-600', bg: 'bg-red-600', label: 'Red' },
    { id: 'blue', class: 'text-blue-600', bg: 'bg-blue-600', label: 'Blue' },
    { id: 'green', class: 'text-green-600', bg: 'bg-green-600', label: 'Green' },
    { id: 'yellow', class: 'text-yellow-500', bg: 'bg-yellow-600', label: 'Yellow' },
    { id: 'purple', class: 'text-purple-600', bg: 'bg-purple-600', label: 'Purple' },
    { id: 'pink', class: 'text-pink-600', bg: 'bg-pink-600', label: 'Pink' },
    { id: 'orange', class: 'text-orange-600', bg: 'bg-orange-600', label: 'Orange' },
];

const ICON_MAP = {
  None: null,
  Plane: Plane, Car: Car, Train: Train, Activity: Activity, Mountain: Mountain, Music: Music,
  Flag: Flag, Heart: Heart, Calendar: Calendar, Footprints: Footprints, Bike: Bike,
  Hotel: Hotel, Map: Map, Globe: Globe, Anchor: Anchor, Ticket: Ticket, Tent: Tent, Home: Home, Truck: Truck, Users: Users, Briefcase: Briefcase,
  Gift: Gift, CalendarDays: CalendarDays,
};
const ICON_KEYS = Object.keys(ICON_MAP);

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const QUILL_MODULES = {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['clean']
    ],
};

const createDateKey = (year, monthIndex, day) => {
    const date = new Date(Date.UTC(year, monthIndex, day));
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const d = date.getUTCDate().toString().padStart(2, '0');
    return `${date.getUTCFullYear()}-${month}-${d}`;
};

const generateCalendarForYear = (year) => {
  const days = {};
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const monthName = MONTHS[monthIndex];
    for (let day = 1; day <= daysInMonth; day++) {
      const key = createDateKey(year, monthIndex, day);
      days[key] = {
        day: day, month: monthName, locations: '', details: '', colorId: 'none', icons: [], year: year
      };
    }
  }
  return days;
};

const DEFAULT_KEY_ITEMS = [];

const ToggleSwitch = ({ checked, onChange, disabled }) => (
    <button 
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

// --- Sub-Component: Icon Picker/Editor Modal ---
const IconEditor = ({ isOpen, onClose, onSave, initialIconData }) => {
    if (!isOpen) return null;
    const [iconType, setIconType] = useState(initialIconData?.value || ICON_KEYS[0]);
    const [iconColor, setIconColor] = useState(initialIconData?.color || ICON_COLOR_OPTIONS[0].class);
    
    const handleSave = () => {
        onSave({ type: 'icon', value: iconType, color: iconColor });
        onClose();
    };
    const IconComponent = ICON_MAP[iconType];

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[70] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl p-6 space-y-4">
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-3">Select Icon and Color</h4>
                <div className="flex space-x-4 items-center">
                    <div className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                        {IconComponent && iconType !== 'None' && <IconComponent size={30} className={iconColor} />}
                    </div>
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">Selected: {iconType}</div>
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    {ICON_KEYS.map(key => {
                        const Icon = ICON_MAP[key];
                        return (
                            <button key={key} onClick={() => setIconType(key)} className={`p-2 rounded-lg border transition-all ${iconType === key ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500' : 'bg-white dark:bg-gray-800 dark:border-gray-700'}`}>
                                {key === 'None' ? <span className="text-xs">None</span> : <Icon size={20} className={iconColor} />}
                            </button>
                        );
                    })}
                </div>
                <div className="flex flex-wrap gap-2">
                    {ICON_COLOR_OPTIONS.map(color => (
                        <button key={color.id} onClick={() => setIconColor(color.class)} className={`w-8 h-8 rounded-full ${color.bg} ${iconColor === color.class ? 'ring-2 ring-offset-2 ring-gray-900' : ''}`} />
                    ))}
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded-lg">Save</button>
                </div>
            </div>
        </div>
    );
}

// --- Component: Configure Modal ---
const ConfigureModal = ({ isOpen, onClose, config, onConfigSave, keyItems, onKeyItemsSave, year, onYearChange }) => {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('general');
    const [localConfig, setLocalConfig] = useState(config);
    const [localKeyItems, setLocalKeyItems] = useState(keyItems);

    // Sync state when year/data changes while modal is open
    useEffect(() => { setLocalKeyItems(keyItems); }, [keyItems]);
    useEffect(() => { setLocalConfig(config); }, [config]);

    const categories = localKeyItems.filter(i => i.isColorKey);
    const icons = localKeyItems.filter(i => !i.isColorKey);

    const [showIconEditor, setShowIconEditor] = useState(false);
    const [editingIconId, setEditingIconId] = useState(null);

    const handleConfigChange = (field, value) => setLocalConfig(prev => ({ ...prev, [field]: value }));

    const previewTitle = () => {
        const y = new Date().getFullYear();
        const n = localConfig.ownerName || 'John';
        switch (localConfig.headerStyle) {
            case 'possessive': return `${n}'s ${y} Calendar`;
            case 'question': return `Where is ${n} in ${y}?`;
            default: return `${y} Calendar`;
        }
    };

    const handleAddCategory = () => {
        if (categories.length >= 5) return;
        setLocalKeyItems(prev => [...prev, {
            id: `cat_${Date.now()}`, label: 'New Category', isColorKey: true, colorCode: 'blue', showCount: false, icon: 'None'
        }]);
    };

    const handleUpdateCategory = (id, field, value) => setLocalKeyItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    const handleDeleteCategory = (id) => setLocalKeyItems(prev => prev.filter(item => item.id !== id));

    const handleAddIconItem = () => {
        setLocalKeyItems(prev => [...prev, {
            id: `icon_${Date.now()}`, label: 'New Activity', isColorKey: false, icon: 'Star', iconColor: ICON_COLOR_OPTIONS[0].class, showCount: false
        }]);
    };
    
    const handleIconEditClick = (id) => { setEditingIconId(id); setShowIconEditor(true); };
    const handleIconSaveFromEditor = (iconData) => {
        if (editingIconId) {
            handleUpdateCategory(editingIconId, 'icon', iconData.value);
            handleUpdateCategory(editingIconId, 'iconColor', iconData.color);
        }
        setShowIconEditor(false); setEditingIconId(null);
    };

    const handleKeyMove = (index, direction, isCategory) => {
        const items = isCategory ? categories : icons;
        const itemToMove = items[index];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= items.length) return;
        
        const swappedItems = [...items];
        [swappedItems[index], swappedItems[newIndex]] = [swappedItems[newIndex], swappedItems[index]];
        
        if (isCategory) {
            setLocalKeyItems([...swappedItems, ...icons]);
        } else {
            setLocalKeyItems([...categories, ...swappedItems]);
        }
    };

    const handleSaveAll = () => {
        onConfigSave(localConfig);
        onKeyItemsSave(localKeyItems);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                            <Settings size={24} className="mr-3 text-blue-500"/> 
                            <span className="hidden sm:inline">Configuration</span>
                            <span className="sm:hidden">Config</span>
                        </h3>
                        
                        {/* Year Switcher */}
                        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600 shadow-sm ml-2">
                             <button onClick={() => onYearChange(year - 1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg border-r dark:border-gray-600 text-gray-600 dark:text-gray-300"><ChevronLeft size={16}/></button>
                             <span className="px-3 font-bold text-gray-800 dark:text-gray-100">{year}</span>
                             <button onClick={() => onYearChange(year + 1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg border-l dark:border-gray-600 text-gray-600 dark:text-gray-300"><ChevronRight size={16}/></button>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><X size={24} /></button>
                </div>
                <div className="flex border-b dark:border-gray-700 bg-white dark:bg-gray-800 px-6">
                    {[
                        { id: 'general', label: 'General', icon: Layout },
                        { id: 'categories', label: 'Categories', icon: Palette },
                        { id: 'activities', label: 'Activities', icon: List }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center py-4 px-6 border-b-2 font-medium transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                            <tab.icon size={18} className="mr-2" /> {tab.label}
                        </button>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                    {activeTab === 'general' && (
                        <div className="space-y-8 max-w-2xl mx-auto">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                                <h4 className="text-lg font-bold mb-4 dark:text-white">Page Appearance</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Header Style</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {[ { id: 'simple', label: '<Year> Calendar' }, { id: 'possessive', label: '<Name>\'s Calendar' }, { id: 'question', label: 'Where is <Name>?' } ].map(opt => (
                                                <button key={opt.id} onClick={() => handleConfigChange('headerStyle', opt.id)} className={`p-3 rounded-lg border text-sm font-medium transition-all ${localConfig.headerStyle === opt.id ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'border-gray-300 dark:border-gray-600'}`}>{opt.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                    {(localConfig.headerStyle === 'possessive' || localConfig.headerStyle === 'question') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner Name</label>
                                            <input type="text" value={localConfig.ownerName || ''} onChange={(e) => handleConfigChange('ownerName', e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g. John" />
                                        </div>
                                    )}
                                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Live Preview</span>
                                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{previewTitle()}</h1>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                                <h4 className="text-lg font-bold mb-4 dark:text-white">Regional Settings</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                                    <input type="text" value={localConfig.timezone} onChange={(e) => handleConfigChange('timezone', e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g. UTC, America/New_York" />
                                    <p className="text-xs text-gray-500 mt-1">Must be a valid IANA timezone. <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones" target="_blank" className="text-blue-500 hover:underline">See List</a></p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'categories' && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Categories color the background of the day cell. (Max 5)</p>
                                <button onClick={handleAddCategory} disabled={categories.length >= 5} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center disabled:opacity-50"><Plus size={16} className="mr-2"/> Add Category</button>
                            </div>
                            <div className="grid gap-4">
                                {categories.map((cat) => (
                                    <div key={cat.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-4">
                                        <div className="flex gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                            {CATEGORY_COLORS.map(c => (
                                                <button key={c.id} onClick={() => handleUpdateCategory(cat.id, 'colorCode', c.id)} className={`w-8 h-8 rounded-full ${c.bg} ${cat.colorCode === c.id ? 'ring-2 ring-offset-2 ring-gray-800 dark:ring-gray-200' : 'opacity-50 hover:opacity-100'}`} title={c.label} />
                                            ))}
                                        </div>
                                        <div className="flex-1 w-full">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Label</label>
                                            <input type="text" value={cat.label} onChange={(e) => handleUpdateCategory(cat.id, 'label', e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Show Count</span>
                                            <ToggleSwitch checked={cat.showCount} onChange={(val) => handleUpdateCategory(cat.id, 'showCount', val)} />
                                        </div>
                                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><X size={20} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'activities' && (
                        <div className="max-w-4xl mx-auto space-y-6">
                             <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Activities appear as small symbols on the day cell.</p>
                                <button onClick={handleAddIconItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center"><Plus size={16} className="mr-2"/> Add Activity</button>
                            </div>
                            <div className="space-y-3">
                                {icons.map((item, index) => {
                                    const IconC = ICON_MAP[item.icon];
                                    // Ensure color is visible if none
                                    const displayColor = (!item.iconColor || item.iconColor === 'none') ? 'text-gray-900 dark:text-gray-100' : item.iconColor;
                                    return (
                                        <div key={item.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl border dark:border-gray-700 shadow-sm flex items-center gap-4">
                                            <button onClick={() => handleIconEditClick(item.id)} className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border dark:border-gray-600 hover:bg-gray-200">
                                                {IconC ? <IconC size={24} className={displayColor} /> : <span className="text-xs">None</span>}
                                            </button>
                                            <div className="flex-1">
                                                <input type="text" value={item.label} onChange={(e) => handleUpdateCategory(item.id, 'label', e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white" placeholder="Activity Name" />
                                            </div>
                                            <div className="flex items-center gap-2 border-l pl-4 dark:border-gray-700">
                                                <span className="text-xs font-medium text-gray-500 uppercase">Count</span>
                                                <ToggleSwitch checked={item.showCount} onChange={(val) => handleUpdateCategory(item.id, 'showCount', val)} />
                                            </div>
                                            <div className="flex items-center space-x-1 border-l pl-2 dark:border-gray-700">
                                                <button onClick={() => handleKeyMove(index, -1, false)} disabled={index === 0} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"><ArrowUp size={16}/></button>
                                                <button onClick={() => handleKeyMove(index, 1, false)} disabled={index === icons.length - 1} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"><ArrowDown size={16}/></button>
                                            </div>
                                            <button onClick={() => handleDeleteCategory(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><X size={18} /></button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSaveAll} className="px-6 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 shadow-lg flex items-center"><Save size={18} className="mr-2" /> Save Configuration</button>
                </div>
            </div>
            <IconEditor isOpen={showIconEditor} onClose={() => setShowIconEditor(false)} onSave={handleIconSaveFromEditor} initialIconData={editingIconId ? localKeyItems.find(i => i.id === editingIconId) : null} />
        </div>
    );
};

const CellEditor = React.memo(({ isOpen, onClose, dayData, onSave, isAdmin, keyItems }) => {
    // Categories List for Selection
    const categories = useMemo(() => keyItems.filter(k => k.isColorKey), [keyItems]);
    // Activities List for "Add Activity" - Filter out empty/invalid ones
    const availableActivities = useMemo(() => keyItems.filter(k => !k.isColorKey && k.icon !== 'None'), [keyItems]);

    // Available Category Colors (for mapping)
    const categoryOptions = useMemo(() => {
        const defaults = [{ id: 'none', label: 'Home', class: 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700' }];
        const cats = categories.map(k => {
            const colorDef = CATEGORY_COLORS.find(c => c.id === k.colorCode) || CATEGORY_COLORS[0];
            return { id: k.id, label: k.label, class: `${colorDef.bg} text-gray-900 border-2 ${colorDef.border}` };
        });
        return [...defaults, ...cats];
    }, [categories]);

    const [localLocations, setLocalLocations] = useState('');
    const [localDetails, setLocalDetails] = useState('');
    const [localColorId, setLocalColorId] = useState('none');
    const [localIcons, setLocalIcons] = useState([]);

    useEffect(() => {
        if (dayData) {
            setLocalLocations(dayData.locations || '');
            setLocalDetails(dayData.details || '');
            setLocalColorId(dayData.colorId || 'none');
            setLocalIcons(dayData.icons || dayData.content || []); 
        }
    }, [dayData]);
  
    const [activeTab, setActiveTab] = useState('category'); // Default tab

    const handleSave = () => {
        onSave({
            ...dayData,
            locations: localLocations,
            details: localDetails,
            colorId: localColorId,
            icons: localIcons,
        });
        onClose();
    };
  
    // Add Activity: Copies properties from the Key Item (Allows multiples)
    const handleAddActivity = (keyItem) => {
        if (localIcons.length >= 4) return;
        setLocalIcons(prev => [...prev, {
            id: Date.now().toString(), // Unique ID per instance
            value: keyItem.icon,
            color: keyItem.iconColor
        }]);
    };
  
    const handleIconDelete = (index) => setLocalIcons(prev => prev.filter((_, i) => i !== index));
    
    // Reorder Handlers for the Cell
    const handleIconMove = (index, direction) => {
        const newIcons = [...localIcons];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= newIcons.length) return;
        [newIcons[index], newIcons[newIndex]] = [newIcons[newIndex], newIcons[index]];
        setLocalIcons(newIcons);
    };

    if (!isOpen || !dayData) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{isAdmin ? 'Edit Day' : 'View Day'} - {dayData.month} {dayData.day}, {dayData.year}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><X size={24} /></button>
                </div>
                {isAdmin && (
                      <div className="flex justify-around bg-gray-100 dark:bg-gray-900 p-2 border-b dark:border-gray-700">
                        {[
                            { id: 'category', label: 'Category', icon: Tag },
                            { id: 'activities', label: 'Activities', icon: Activity },
                            { id: 'location', label: 'Location & Notes', icon: MapPin }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)} 
                                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                            >
                                <tab.icon size={16} className="mr-1.5"/> {tab.label}
                            </button>
                        ))}
                    </div>
                )}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {!isAdmin ? (
                         // View Mode
                         <div className="space-y-4">
                            <div className="text-gray-700 dark:text-gray-300 flex flex-wrap items-center gap-2">
                                <strong>Location(s):</strong>
                                {(localLocations && localLocations.length > 0) ? (
                                    localLocations.split(',').map(loc => loc.trim()).filter(Boolean).map((location, index) => (
                                    <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-800 dark:text-gray-200 break-all">{location}</span>
                                    ))
                                ) : <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-800 dark:text-gray-200 break-all">Home</span>}
                            </div>
                            {localIcons.length > 0 && (
                                <div className="space-y-2">
                                    {localIcons.map((item, index) => {
                                        const iconValue = item.value || item.icon; 
                                        if (iconValue !== 'None' && ICON_MAP[iconValue]) {
                                            const IconComponent = ICON_MAP[iconValue];
                                            const keyItem = keyItems.find(k => k.icon === iconValue && k.iconColor === item.color);
                                            return (
                                                <div key={index} className="flex items-center space-x-3 p-2 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                                                    <IconComponent size={20} className={item.color} />
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{keyItem ? keyItem.label : iconValue}</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            )}
                            {localDetails && <div className="ql-editor prose prose-sm dark:prose-invert max-w-none mt-2 p-3 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-y-auto" style={{ maxHeight: '150px' }} dangerouslySetInnerHTML={{ __html: localDetails }} />}
                         </div>
                    ) : (
                        // Admin Mode
                        <>
                            {activeTab === 'category' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Select a category for this day:</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {categoryOptions.map(color => (
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
                            )}

                            {activeTab === 'activities' && (
                                <div className="space-y-6">
                                    {/* Current Activities */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Selected (Max 4)</h4>
                                        {localIcons.length === 0 && <p className="text-sm italic text-gray-500">No activities selected.</p>}
                                        {localIcons.map((item, index) => {
                                             const iconValue = item.value || item.icon;
                                             const IconComponent = ICON_MAP[iconValue];
                                             if (!IconComponent) return null;
                                             // Find label from key
                                             const keyDef = keyItems.find(k => k.icon === iconValue && k.iconColor === item.color);
                                             return (
                                                 <div key={index} className="flex items-center justify-between p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                                                     <div className="flex items-center space-x-2">
                                                         <IconComponent size={20} className={item.color} />
                                                         <span className="text-sm font-medium dark:text-gray-200">{keyDef ? keyDef.label : iconValue}</span>
                                                     </div>
                                                     <div className="flex items-center space-x-1">
                                                        <button onClick={() => handleIconMove(index, -1)} disabled={index === 0} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ArrowUp size={16}/></button>
                                                        <button onClick={() => handleIconMove(index, 1)} disabled={index === localIcons.length - 1} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ArrowDown size={16}/></button>
                                                        <button onClick={() => handleIconDelete(index)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={16}/></button>
                                                     </div>
                                                 </div>
                                             )
                                        })}
                                    </div>
                                    
                                    {/* Add New Activity */}
                                    {localIcons.length < 4 && (
                                        <div className="space-y-2 pt-4 border-t dark:border-gray-700">
                                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Add Activity</h4>
                                            {availableActivities.length > 0 ? (
                                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                                    {availableActivities.map(keyItem => {
                                                        const IconC = ICON_MAP[keyItem.icon];
                                                        const displayColor = (!keyItem.iconColor || keyItem.iconColor === 'none') ? 'text-gray-900 dark:text-gray-100' : keyItem.iconColor;
                                                        return (
                                                            <button 
                                                                key={keyItem.id} 
                                                                onClick={() => handleAddActivity(keyItem)}
                                                                className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border dark:border-gray-600 text-left"
                                                            >
                                                                {IconC && <IconC size={16} className={`${displayColor} mr-2`} />}
                                                                <span className="text-xs font-medium truncate dark:text-gray-200">{keyItem.label}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 italic p-2 border border-dashed border-gray-300 rounded-lg">
                                                    No activities defined in Key. Go to Configure > Activities to add some.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'location' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location(s) (comma-seperated)</label>
                                        <input type="text" value={localLocations} onChange={(e) => setLocalLocations(e.target.value)} className="w-full border rounded-lg p-2 font-bold dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g. NYC, London" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                                        <ReactQuill theme="snow" value={localDetails} onChange={setLocalDetails} modules={QUILL_MODULES} className="quill-editor-custom" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-end space-x-3">
                    {isAdmin && <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"><Save size={18} className="mr-2" /> Save</button>}
                    {!isAdmin && <button onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg">Close</button>}
                </div>
            </div>
        </div>
    );
});

// --- Authentication Modal ---
const AuthModal = ({ isOpen, onClose, onAuthenticate }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Reset state when modal opens
  useEffect(() => { 
    if (isOpen) {
        setPassword('');
        setLocalError(null);
        setIsLoading(false);
    } 
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    try {
        const response = await fetch('/api/auth/login', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ password }) 
        });

        if (response.ok) {
            const { role, token } = await response.json();
            onAuthenticate(role, token);
            onClose();
        } else {
            // Set error locally - immediate feedback
            setLocalError("Incorrect admin password.");
        }
    } catch (e) { 
        console.error("Auth error:", e); 
        setLocalError("Connection error."); 
    } 
    finally { setIsLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-[80] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><X size={24} /></button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center"><Lock size={24} className="mr-2 text-blue-500" /> Admin Access</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => { setPassword(e.target.value); setLocalError(null); }} 
                className={`w-full border rounded-lg p-3 text-lg dark:bg-gray-700 dark:text-white transition-colors ${localError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} 
                placeholder="Enter Password" 
                disabled={isLoading} 
                autoFocus
              />
              {localError && <p className="text-red-500 text-sm mt-2 font-bold">{localError}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors">
            {isLoading ? <Loader size={20} className="animate-spin" /> : <LogIn size={20} />}
            <span className="ml-2">Authenticate</span>
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [config, setConfig] = useState({ timezone: 'UTC', headerStyle: 'simple', ownerName: '' });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [role, setRole] = useState('view');
  const [adminToken, setAdminToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [isSaving, setIsSaving] =useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeCell, setActiveCell] = useState(null); 
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [keyItems, setKeyItems] = useState(DEFAULT_KEY_ITEMS);
  const [lastUpdatedText, setLastUpdatedText] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [isKeyExpanded, setIsKeyExpanded] = useState(false);
  const [highlightFilters, setHighlightFilters] = useState({ locations: [], icons: [] });
  const [expandedMonths, setExpandedMonths] = useState({});
  const [apiError, setApiError] = useState(null);
  const wsRef = useRef(null);

  // Effect to Initialize Mobile View (Expand current month & Scroll)
  useEffect(() => {
    // Determine current month based on config timezone
    let now;
    try {
        now = new Date(new Date().toLocaleString('en-US', { timeZone: config.timezone }));
    } catch (e) {
        now = new Date();
    }
    const currentMonthIdx = now.getMonth();
    
    // 1. Expand only the current month initially
    setExpandedMonths({ [currentMonthIdx]: true });

    // 2. Auto-scroll to current month ONLY on mobile (width < 768px)
    if (window.innerWidth < 768) {
        setTimeout(() => {
            const element = document.getElementById(`month-${currentMonthIdx}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500);
    }
  }, [config.timezone]);

  const toggleMonth = (idx) => {
      setExpandedMonths(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Dark Mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setIsDarkMode(true); document.documentElement.classList.add('dark');
    } else {
        setIsDarkMode(false); document.documentElement.classList.remove('dark');
    }
  }, []);
  const toggleDarkMode = () => {
      setIsDarkMode(prev => {
          const newMode = !prev;
          document.documentElement.classList.toggle('dark', newMode);
          localStorage.setItem('theme', newMode ? 'dark' : 'light');
          return newMode;
      });
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (activeCell || showConfigureModal || showAuthModal) return; 
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowLeft') setYear(y => y - 1);
        if (e.key === 'ArrowRight') setYear(y => y + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, showConfigureModal, showAuthModal]);

  // Config Fetch
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const appConfig = await response.json();
        setConfig(appConfig);
        try {
            const now = new Date(new Date().toLocaleString('en-US', { timeZone: appConfig.timezone }));
            setYear(now.getFullYear());
        } catch (e) { console.warn("Invalid timezone"); }
      } catch (e) { console.error("Config fetch error", e); }
    };
    fetchConfig();
  }, []);

  // WebSocket
  useEffect(() => {
    const getWebSocketURL = () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}`;
    };
    const connectWebSocket = () => {
        wsRef.current = new WebSocket(getWebSocketURL());
        wsRef.current.onopen = () => setApiError(null);
        wsRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'DATA_UPDATE') {
                const { year: uYear, data: uData } = message.payload;
                setYear(prev => {
                    if (uYear === prev) {
                        setCalendarData(uData.dayData);
                        setKeyItems(uData.keyItems || DEFAULT_KEY_ITEMS);
                        setLastUpdatedText(uData.lastUpdatedText);
                    }
                    return prev;
                });
            } else if (message.type === 'CONFIG_UPDATE') {
                setConfig(message.payload);
            }
        };
        wsRef.current.onclose = () => { setTimeout(connectWebSocket, 3000); };
    };
    connectWebSocket();
    return () => wsRef.current?.close();
  }, []);

  // Data Fetch
  const fetchData = useCallback(async (currentYear) => {
    setIsDataLoading(true);
    try {
        const response = await fetch(`/api/data/${currentYear}`);
        const data = await response.json();
        if (!data.dayData) {
            const defaultData = { dayData: generateCalendarForYear(currentYear), keyItems: DEFAULT_KEY_ITEMS, lastUpdatedText: '' };
            setCalendarData(defaultData.dayData); setKeyItems(defaultData.keyItems); setLastUpdatedText('');
        } else {
            setCalendarData(data.dayData); setKeyItems(data.keyItems || DEFAULT_KEY_ITEMS); setLastUpdatedText(data.lastUpdatedText);
        }
    } catch (e) { setApiError("Failed to load data"); setCalendarData({}); } 
    finally { setIsDataLoading(false); }
  }, []);

  useEffect(() => { fetchData(year); }, [year, fetchData]);

  // Page Title
  useEffect(() => { 
      let title = `${year} Calendar`;
      if (config.headerStyle === 'possessive' && config.ownerName) title = `${config.ownerName}'s ${year} Calendar`;
      else if (config.headerStyle === 'question' && config.ownerName) title = `Where is ${config.ownerName}?`;
      document.title = title;
  }, [year, config]);

  const saveData = useCallback(async (dataToSave) => {
    if (role !== 'admin' || !adminToken) return;
    setIsSaving(true);
    try {
        await fetch(`/api/data/${year}`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }, body: JSON.stringify(dataToSave) 
        });
    } catch (e) { setApiError("Save failed"); } finally { setTimeout(() => setIsSaving(false), 500); }
  }, [role, adminToken, year]);

  const saveConfig = async (newConfig) => {
      if (role !== 'admin' || !adminToken) return;
      try {
          const res = await fetch('/api/config', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }, body: JSON.stringify(newConfig) 
          });
          if (res.ok) setConfig(newConfig);
      } catch(e) { setApiError("Config save failed"); }
  };

  // Handlers
  const handleDayUpdate = (updatedDayData) => {
    const dayKey = activeCell; // Use captured activeCell
    if (!dayKey) return;
    updatedDayData.year = parseInt(dayKey.split('-')[0], 10);
    const newDayData = { ...calendarData, [dayKey]: updatedDayData };
    setCalendarData(newDayData);
    const ts = new Date().toLocaleDateString();
    setLastUpdatedText(ts);
    saveData({ dayData: newDayData, keyItems, lastUpdatedText: ts });
  };

  const handleKeyUpdate = (newKeyItems) => {
      setKeyItems(newKeyItems);
      const ts = new Date().toLocaleDateString();
      setLastUpdatedText(ts);
      saveData({ dayData: calendarData, keyItems: newKeyItems, lastUpdatedText: ts });
  };

  const handleLocationFilterToggle = (loc) => {
      setHighlightFilters(prev => ({ ...prev, locations: prev.locations.includes(loc) ? prev.locations.filter(l => l !== loc) : [...prev.locations, loc] }));
  };
  const handleIconFilterToggle = (item) => {
      const exists = highlightFilters.icons.find(f => f.icon === item.icon && f.iconColor === item.iconColor);
      setHighlightFilters(prev => ({ ...prev, icons: exists ? prev.icons.filter(i => i !== exists) : [...prev.icons, { icon: item.icon, iconColor: item.iconColor }] }));
  };
  const shouldHighlightCell = (dayInfo) => {
      if (!highlightFilters.locations.length && !highlightFilters.icons.length) return false;
      const dayLocs = (dayInfo.locations || '').split(',').map(l=>l.trim()).filter(Boolean);
      const locMatch = !highlightFilters.locations.length || highlightFilters.locations.every(f => dayLocs.includes(f));
      const dayIcons = dayInfo.icons || dayInfo.content || [];
      const iconMatch = !highlightFilters.icons.length || highlightFilters.icons.every(f => dayIcons.some(d => (d.value||d.icon) === f.icon && d.color === f.iconColor));
      return locMatch && iconMatch;
  };

  // Stats Logic
  const stats = useMemo(() => {
    if (!calendarData) return { totalDays: 0, categories: {}, totalHighlighted: 0 };
    const totalDays = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
    const catStats = {}; 
    let totalHighlighted = 0;
    keyItems.filter(k => k.isColorKey).forEach(k => catStats[k.id] = 0);
    Object.values(calendarData).forEach(day => {
        if (day.colorId && day.colorId !== 'none' && catStats[day.colorId] !== undefined) {
            catStats[day.colorId]++;
            totalHighlighted++;
        }
    });
    return { totalDays, categories: catStats, totalHighlighted };
  }, [calendarData, year, keyItems]);

  const iconCounts = useMemo(() => {
      if (!calendarData) return {};
      const counts = {};
      Object.values(calendarData).forEach(day => {
          (day.icons||[]).forEach(i => {
             const key = `${i.value||i.icon}-${i.color}`;
             counts[key] = (counts[key]||0)+1;
          });
      });
      return counts;
  }, [calendarData]);

  const locationCounts = useMemo(() => {
    if (!calendarData) return [];
    const counts = {};
    Object.values(calendarData).forEach(d => (d.locations||'').split(',').map(l=>l.trim()).filter(Boolean).forEach(l => counts[l] = (counts[l]||0)+1));
    return Object.entries(counts).sort(([,a],[,b])=>b-a);
  }, [calendarData]);

  if (isDataLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-200 dark:bg-gray-900"><Loader className="animate-spin" size={48}/></div>;

  const renderMonth = (mIdx) => {
    const mName = MONTHS[mIdx];
    const isTodayYear = new Date().getFullYear() === year;
    const firstDay = new Date(Date.UTC(year, mIdx, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, mIdx+1, 0)).getUTCDate();
    const cells = [];
    let monthHighCount = 0; 
    
    for(let i=0; i<firstDay; i++) cells.push(<td key={`p-${i}`} className="p-1 bg-gray-50 dark:bg-gray-800/50"></td>);

    for(let d=1; d<=daysInMonth; d++) {
        const key = createDateKey(year, mIdx, d);
        const day = calendarData[key] || { day: d, month: mName, locations: '', icons: [], colorId: 'none' };
        
        if (day.colorId !== 'none') monthHighCount++; 

        let colorClass = 'bg-white dark:bg-gray-800';
        if (day.colorId !== 'none') {
             const cat = keyItems.find(k => k.id === day.colorId);
             if (cat) {
                 const cDef = CATEGORY_COLORS.find(c => c.id === cat.colorCode);
                 if (cDef) colorClass = `${cDef.bg}`; 
             }
        }
        
        const isHigh = shouldHighlightCell(day);
        const icons = (day.icons||[]).filter(i=>i.value!=='None');
        
        cells.push(
            <td key={key} onClick={()=>setActiveCell(key)} className={`p-0.5 border border-gray-200 dark:border-gray-700 h-28 w-1/7 cursor-pointer ${colorClass}`}>
                <div className={`h-full flex flex-col justify-between p-1 ${isHigh ? 'relative ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 z-10' : ''}`}>
                    <div className="flex flex-col items-center">
                        <span className={`text-xl font-bold ${createDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) === key && isTodayYear ? 'bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center' : (day.colorId !== 'none' ? 'text-gray-900' : 'text-gray-800 dark:text-gray-100')}`}>{d}</span>
                        {(day.locations||'').split(',').map(l=>l.trim()).filter(Boolean).length > 0 && (
                            <div className="flex flex-wrap justify-center gap-1 mt-1.5 w-full">
                                {(day.locations||'').split(',').map(l=>l.trim()).filter(Boolean).map((l,i) => 
                                    <span key={i} className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-white/50 text-gray-900 break-all">{l}</span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center items-end">
                        {icons.slice(0,4).map((i,idx) => {
                            const IC = ICON_MAP[i.value||i.icon];
                            const isYellow = i.color === 'text-yellow-500';
                            const shadowClass = isYellow ? 'dark:[filter:drop-shadow(0px_0px_1px_rgba(0,0,0,1))]' : '';
                            return IC ? <div key={idx} className="w-1/2 flex justify-center shrink-0 h-[18px] sm:h-6"><IC className={`${i.color} ${shadowClass} shrink-0 w-[18px] h-[18px] sm:w-6 sm:h-6`} strokeWidth={2.5} /></div> : null;
                        })}
                    </div>
                </div>
            </td>
        );
    }
    while(cells.length % 7 !== 0) cells.push(<td key={`pe-${cells.length}`} className="p-1 bg-gray-50 dark:bg-gray-800/50"></td>);
    const rows = [];
    for(let i=0; i<cells.length; i+=7) rows.push(<tr key={i}>{cells.slice(i, i+7)}</tr>);

    // Accordion Logic
    const isExpanded = expandedMonths[mIdx];

    return (
        <div key={mName} id={`month-${mIdx}`} className="w-full lg:w-1/3 p-2">
             {/* Header: Clickable on mobile to toggle, normal on desktop */}
             <div 
                className="flex justify-between items-center mb-2 mt-4 cursor-pointer md:cursor-default"
                onClick={() => toggleMonth(mIdx)}
             >
                 <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                     {mName}
                     {/* Mobile Chevron */}
                     <span className="md:hidden ml-2 text-gray-500">
                        {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                     </span>
                 </h2>
                 <span className="text-sm font-normal bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                    {monthHighCount} / {daysInMonth} days ({Math.round((monthHighCount/daysInMonth)*100)}%)
                 </span>
             </div>

             {/* Content: Hidden on mobile unless expanded, Always Block on Desktop (md:block) */}
             <div className={`${isExpanded ? 'block' : 'hidden'} md:block rounded-lg shadow-sm overflow-hidden border border-gray-300 dark:border-gray-700`}>
                 <table className="w-full table-fixed border-collapse">
                     <thead><tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                         {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(h=><th key={h} className="p-2 border-b border-gray-300 dark:border-gray-600">{h}</th>)}
                     </tr></thead>
                     <tbody>{rows}</tbody>
                 </table>
             </div>
        </div>
    );
  };

  const renderHeaderTitle = () => {
      const y = year;
      const n = config.ownerName || '';
      if (config.headerStyle === 'possessive' && n) return <>{n}'s <span className="text-blue-600 ml-1">{y}</span> Calendar</>;
      if (config.headerStyle === 'question' && n) return <>Where is {n} in <span className="text-blue-600">{y}</span>?</>;
      return <><span className="text-blue-600 mr-2">{y}</span> Calendar</>;
  };

  // Split KeyItems for Key Display
  const keyCategories = keyItems.filter(k => k.isColorKey);
  const keyActivities = keyItems.filter(k => !k.isColorKey);

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
        {config.bannerHtml && <div className="sticky top-0 z-[70] bg-yellow-100 border-b-4 border-yellow-500 text-yellow-900 p-4 text-center font-semibold" dangerouslySetInnerHTML={{ __html: config.bannerHtml }} />}
        
        <div className="max-w-screen-2xl mx-auto p-4 sm:p-6">
            <header className="mb-8 border-b dark:border-gray-700 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <h1 className="text-2xl sm:text-4xl font-extrabold flex items-center">
                        <CalendarDays size={36} className="mr-3 text-blue-600 hidden sm:block" />
                        <span>{renderHeaderTitle()}</span>
                    </h1>
                    <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                            <button onClick={()=>setYear(y=>y-1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><ChevronLeft size={20}/></button>
                            <span className="font-semibold">{year}</span>
                            <button onClick={()=>setYear(y=>y+1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><ChevronRight size={20}/></button>
                        </div>
                        <button onClick={toggleDarkMode} className="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
                        {role==='admin' ? (
                            <>
                                <button onClick={()=>setShowConfigureModal(true)} className="h-10 w-10 sm:w-auto sm:px-4 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <Settings size={20} className="sm:mr-2"/>
                                    <span className="hidden sm:inline">Configure</span>
                                </button>
                                <button onClick={()=>{setRole('view'); setAdminToken(null);}} className="h-10 w-10 sm:w-auto sm:px-4 flex items-center justify-center bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                                    <LogOut size={20} className="sm:mr-2"/>
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <button onClick={()=>setShowAuthModal(true)} className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Lock size={20}/></button>
                        )}
                    </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center justify-center sm:justify-start">
                    <span className="mr-2">Last updated:</span>
                    <span className="font-semibold">{lastUpdatedText}</span>
                    {isSaving && <span className="ml-2 text-xs text-blue-500 flex items-center"><Loader size={12} className="mr-1 animate-spin"/> Saving...</span>}
                </p>
            </header>

            <section className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mb-8">
            <div 
                className="flex justify-between items-center mb-4 cursor-pointer md:cursor-default"
                onClick={() => setIsKeyExpanded(!isKeyExpanded)}
            >
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Key</h2>

                <div className="flex items-center gap-3">
                    {(highlightFilters.locations.length > 0 || highlightFilters.icons.length > 0) && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setHighlightFilters({locations:[], icons:[]}); }}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center"
                    >
                        <X size={16} className="mr-1" />
                        Clear Filters
                    </button>
                    )}
                    
                    <span className="md:hidden text-gray-800 dark:text-gray-100">
                        {isKeyExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </span>
                </div>
            </div>

            {/* Collapsible Content Wrapper */}
            <div className={`${isKeyExpanded ? 'block' : 'hidden'} md:block space-y-6`}>
                {/* Categories Section */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categories</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {keyCategories.map(item => {
                            const cDef = CATEGORY_COLORS.find(c=>c.id === item.colorCode);
                            let boxClass = 'bg-gray-100';
                            if (cDef) boxClass = `${cDef.bg} text-white dark:text-gray-100`;

                            return (
                                <div key={item.id} className="flex items-center p-2 rounded-lg space-x-2 border dark:border-gray-600 cursor-default">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${boxClass} border dark:border-gray-500 flex-shrink-0`}></div>
                                    <span className="font-medium flex-1 break-words min-w-0 text-sm sm:text-base">{item.label}</span>
                                    {item.showCount && <span className="ml-auto bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">{stats.categories[item.id]||0}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t dark:border-gray-700"></div>

                {/* Activities Section */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Activities</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {keyActivities.map(item => {
                            const IconC = ICON_MAP[item.icon];
                            const isSelected = highlightFilters.icons.some(f => f.icon === item.icon && f.iconColor === item.iconColor);
                            const dispColor = (!item.iconColor || item.iconColor === 'none') ? 'text-gray-900 dark:text-gray-100' : item.iconColor;

                            return (
                                <div key={item.id} onClick={()=>handleIconFilterToggle(item)} className={`flex items-center p-2 rounded-lg space-x-2 border dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 border dark:border-gray-500 flex-shrink-0">
                                        {IconC && <IconC size={20} className={dispColor} />}
                                    </div>
                                    <span className="font-medium flex-1 break-words min-w-0 text-sm sm:text-base">{item.label}</span>
                                    {item.showCount && <span className="ml-auto bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">{iconCounts[`${item.icon}-${item.iconColor}`]||0}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>

            <section className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mb-8">
                <h2 className="text-2xl font-bold mb-4 cursor-pointer flex justify-between" onClick={()=>setIsStatsExpanded(!isStatsExpanded)}>
                    {year} Stats <span className="md:hidden">{isStatsExpanded?<ChevronUp/>:<ChevronDown/>}</span>
                </h2>
                <div className={`${isStatsExpanded?'block':'hidden'} md:block`}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                             <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold">Days Traveling</p>
                             <p className="text-3xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">{stats.totalHighlighted} days</p>
                         </div>
                         <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                             <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold">Time Traveling</p>
                             <p className="text-3xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">{Math.round((stats.totalHighlighted/stats.totalDays)*100)}%</p>
                         </div>
                     </div>

                     <div className="mt-6 pt-4 border-t dark:border-gray-700">
                         <h3 className="text-lg font-semibold mb-3">Location Counts</h3>
                         <div className="flex flex-wrap gap-2">
                             {locationCounts.map(([loc, count]) => (
                                 <button type="button" key={loc} onClick={()=>handleLocationFilterToggle(loc)} className={`px-3 py-1 rounded-lg flex items-center space-x-2 transition-all border ${highlightFilters.locations.includes(loc)?'bg-blue-600 text-white border-transparent shadow-lg':'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                     <span className="font-medium dark:text-gray-200">{loc}</span>
                                     <span className="ml-2 bg-blue-100 text-blue-700 dark:bg-gray-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold">{count}</span>
                                 </button>
                             ))}
                         </div>
                     </div>
                </div>
            </section>

            <div className="flex flex-wrap -m-2">
                {MONTHS.map((_, i) => renderMonth(i))}
            </div>
        </div>

        <CellEditor isOpen={!!activeCell} onClose={()=>setActiveCell(null)} dayData={activeCell?calendarData[activeCell]:null} onSave={handleDayUpdate} isAdmin={role==='admin'} keyItems={keyItems} />
        <ConfigureModal isOpen={showConfigureModal} onClose={()=>setShowConfigureModal(false)} config={config} onConfigSave={saveConfig} keyItems={keyItems} onKeyItemsSave={handleKeyUpdate} year={year} onYearChange={setYear} />
        <AuthModal isOpen={showAuthModal} onClose={()=>setShowAuthModal(false)} onAuthenticate={(r,t)=>{setRole(r);setAdminToken(t);}} isLoading={authLoading} setIsLoading={setAuthLoading} authError={authError} />
        
        <footer className="max-w-screen-2xl mx-auto p-4 sm:p-6 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-300 dark:border-gray-700 mt-12">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <span>v0.5</span>
                <span className="hidden sm:inline">|</span>
                <a href="https://github.com/thebronway/calendar-app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    <Github size={16} /> GitHub
                </a>
                <span className="hidden sm:inline">|</span>
                <a href="https://hub.docker.com/r/thebronway/calendar-app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    <Database size={16} /> Docker Hub
                </a>
            </div>
        </footer>
    </div>
  );
}