import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill'; // NEW
import { 
    Plane, Car, Train, Activity, Mountain, Music, Flag, Heart, Calendar, Lock, 
    User, Check, Edit, Save, Plus, X, Footprints, Bike, Palette, AlertTriangle, CloudOff, Loader,
    Hotel, Map, Globe, Anchor, Ticket, Tent, Home, Truck, Users, Briefcase, ChevronLeft, ChevronRight, Gift,
    LogIn, LogOut, ArrowUp, ArrowDown, Moon, Sun, Settings 
    // REMOVED: Bold, Italic, Underline, List
} from 'lucide-react';

// --- Configuration and Utility ---

// Cell background color options
const COLOR_OPTIONS = [
  { id: 'none', label: 'Home/Default', class: 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700' },
  { id: 'orange', label: 'Away From Home', class: 'bg-orange-400 hover:bg-orange-500' },
];

// Available colors for icons/key swatches
const KEY_COLOR_OPTIONS = [
    { id: 'gray', class: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-900 dark:bg-gray-100', label: 'Black/Gray' },
    { id: 'red', class: 'text-red-600', bg: 'bg-red-600', label: 'Red' },
    { id: 'blue', class: 'text-blue-600', bg: 'bg-blue-600', label: 'Blue' },
    { id: 'green', class: 'text-green-600', bg: 'bg-green-600', label: 'Green' },
    { id: 'yellow', class: 'text-yellow-500', bg: 'bg-yellow-600', label: 'Yellow' },
    { id: 'purple', class: 'text-purple-600', bg: 'bg-purple-600', label: 'Purple' },
    { id: 'pink', class: 'text-pink-600', bg: 'bg-pink-600', label: 'Pink' },
    { id: 'orange', class: 'text-orange-600', bg: 'bg-orange-600', label: 'Orange' },
];

// Map of available icons (lucide-react) for the editor
const ICON_MAP = {
  None: null,
  Plane: Plane, Car: Car, Train: Train, Activity: Activity, Mountain: Mountain, Music: Music,
  Flag: Flag, Heart: Heart, Calendar: Calendar, Footprints: Footprints, Bike: Bike,
  Hotel: Hotel, Map: Map, Globe: Globe, Anchor: Anchor, Ticket: Ticket, Tent: Tent, Home: Home, Truck: Truck, Users: Users, Briefcase: Briefcase,
  Gift: Gift,
};
const ICON_KEYS = Object.keys(ICON_MAP);

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

// --- NEW: Configuration for the Rich Text Editor ---
const QUILL_MODULES = {
    toolbar: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote'],
        ['clean']
    ],
};

// --- Date Key Generation Utility ---
const createDateKey = (year, monthIndex, day) => {
    const date = new Date(Date.UTC(year, monthIndex, day));
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const d = date.getUTCDate().toString().padStart(2, '0');
    return `${date.getUTCFullYear()}-${month}-${d}`;
};

// --- Calendar Initialization and Default Data ---
const generateCalendarForYear = (year) => {
  const days = {};
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const monthName = MONTHS[monthIndex];
    for (let day = 1; day <= daysInMonth; day++) {
      const key = createDateKey(year, monthIndex, day);
      days[key] = {
        day: day,
        month: monthName,
        text1: '', // Location
        text2: '', // Details (now HTML)
        colorId: 'none',
        icons: [], // Use 'icons' array
        isText1Bold: true, // Location is now always bold
        isText2Bold: false,
        year: year
      };
    }
  }
  return days;
};


// Default Key Items
const DEFAULT_KEY_ITEMS = [
    { id: 'orange', label: 'Away From Home', icon: 'None', iconColor: KEY_COLOR_OPTIONS.find(c => c.id === 'gray').class, isColorKey: true },
];

// --- Sub-Component: Icon Picker/Editor Modal ---
const IconEditor = ({ isOpen, onClose, onSave, initialIconData }) => {
    if (!isOpen) return null;

    const [iconType, setIconType] = useState(initialIconData?.value || ICON_KEYS[0]);
    const [iconColor, setIconColor] = useState(initialIconData?.color || KEY_COLOR_OPTIONS[0].class);
    
    const handleSave = () => {
        onSave({ type: 'icon', value: iconType, color: iconColor });
        onClose();
    };

    const IconComponent = ICON_MAP[iconType];

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl p-6 space-y-4">
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-3">Select Icon and Color</h4>
                
                <div className="flex space-x-4 items-center">
                    <div className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                        {IconComponent && iconType !== 'None' && <IconComponent size={30} className={iconColor} />}
                    </div>
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">Selected: {iconType}</div>
                </div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Icon Type</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                    {ICON_KEYS.map(key => {
                        const Icon = ICON_MAP[key];
                        const isNone = key === 'None';
                        return (
                            <button
                                key={key}
                                onClick={() => setIconType(key)}
                                className={`p-2 rounded-lg border transition-all flex flex-col items-center justify-center text-sm ${
                                    iconType === key ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-600 shadow-md' : 'bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                                title={key}
                            >
                                {isNone ? (
                                    <span className="text-gray-500 dark:text-gray-400 text-xs py-[6px]">No Icon</span>
                                ) : (
                                    <Icon size={20} className={iconColor} />
                                )}
                            </button>
                        );
                    })}
                </div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"><Palette size={16} className="mr-1" /> Icon Color</label>
                <div className="flex flex-wrap gap-2">
                    {KEY_COLOR_OPTIONS.map(color => (
                        <button
                            key={color.id}
                            onClick={() => setIconColor(color.class)}
                            className={`flex items-center justify-center p-2 rounded-full w-10 h-10 border-2 transition-all ${color.bg} ${iconColor === color.class ? 'ring-4 ring-offset-2 ring-gray-900/50' : 'border-gray-600'}`}
                            title={color.label}
                        >
                            {iconColor === color.class && <Check size={20} className="text-white drop-shadow-md" />}
                        </button>
                    ))}
                </div>

                <div className="pt-4 border-t dark:border-gray-700 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 font-bold py-2 px-4 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                        <Save size={18} className="mr-2" /> Save Icon
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- REWRITE: Sub-Component StaticView (Moved Outside) ---
// This is now a stable, memoized component and will not be re-defined on every render.
const StaticView = React.memo(({ localText1, localText2, localIcons }) => (
  <div className="space-y-4 p-6">
    
    <p className="text-gray-700 dark:text-gray-300">
      <strong>Location:</strong> <span className="font-bold">{localText1 || '-'}</span>
    </p>
    
    {localIcons && localIcons.length > 0 && (
      <>
        <div className="flex flex-wrap gap-2 mt-1">
            {localIcons.map((item, index) => {
              // Handle legacy content array
              const iconValue = item.value || item.icon; 
              if (item.type === 'icon' && iconValue !== 'None' && ICON_MAP[iconValue]) {
                const IconComponent = ICON_MAP[iconValue];
                return (
                  <div key={item.id || index} className="flex flex-col items-center p-2 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <IconComponent size={24} className={item.color} />
                  </div>
                );
              }
              return null;
            }).filter(Boolean)}
        </div>
      </>
    )}

    {/* Render Details using dangerouslySetInnerHTML */}
    {localText2 && (
       <div>
          <div 
          className="prose prose-sm dark:prose-invert max-w-none mt-2 p-3 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-y-auto whitespace-pre-wrap 
                      [&_blockquote]:m-0 [&_blockquote]:border-none [&_blockquote]:bg-transparent [&_blockquote]:pl-6"
          style={{ maxHeight: '150px' }}
          dangerouslySetInnerHTML={{ __html: localText2 }}
          />
       </div>
    )}
  </div>
));

// --- REWRITE: Sub-Component RichTextEditor (Moved Outside) ---
// This now uses ReactQuill for a true WYSIWYG experience.
const RichTextEditor = React.memo(({
  isAdmin, activeTab, setActiveTab,
  localText1, setLocalText1,
  localText2, setLocalText2, // REMOVED: text2Ref, formatText
  localColorId, setLocalColorId,
  localIcons,
  handleIconMove, setEditingIconIndex, setShowIconEditor, handleIconDelete
}) => {
  return (
    <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
      <div className="flex justify-around bg-gray-100 dark:bg-gray-900 p-2 rounded-lg">
        <button onClick={() => setActiveTab('text')} className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${activeTab === 'text' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Text & Color</button>
        <button onClick={() => setActiveTab('icons')} className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${activeTab === 'icons' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Icons</button>
      </div>

      {activeTab === 'text' && (
        <div className="space-y-4">
            
          {/* Line 1 (Location) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <input
              type="text"
              value={localText1}
              onChange={(e) => setLocalText1(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 font-bold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Location"
              disabled={!isAdmin}
            />
          </div>

          {/* Line 2 (Details) - NEW ReactQuill Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Details</label>
            <ReactQuill 
              theme="snow" 
              value={localText2} 
              onChange={setLocalText2} // Directly sets the HTML string state
              modules={QUILL_MODULES}
              readOnly={!isAdmin}
              placeholder="Activity details"
              className="quill-editor-custom" // Custom class for styling
            />
          </div>
            
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(color => (
              <div key={color.id} className="relative group">
                  <button
                    onClick={() => setLocalColorId(color.id)}
                    className={`flex items-center justify-center p-2 rounded-full w-12 h-12 border-2 transition-all ${color.class.split(' ').filter(cls => cls.startsWith('bg-')).join(' ')} ${localColorId === color.id ? 'ring-4 ring-offset-2 ring-blue-500' : 'border-gray-300/50 dark:border-gray-600/50 hover:ring-2 hover:ring-gray-300'}`}
                    title={color.label}
                    disabled={!isAdmin}
                  >
                    {localColorId === color.id && <Check size={20} className={`${color.id === 'none' ? 'text-gray-900' : 'text-white'} drop-shadow-md`} />}
                  </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'icons' && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">Activity Icons</label>
            
          <div className="flex flex-col gap-3 p-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 min-h-[5rem]">
              {localIcons.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm italic">No icons added yet. Click 'Add Icon' to start.</p>
              ) : (
                  localIcons.map((item, index) => {
                      const iconValue = item.value || item.icon; // Handle legacy
                      const IconComponent = ICON_MAP[iconValue];
                      if (iconValue === 'None' || !IconComponent) return null;

                      return (
                          <div key={item.id || index} className="flex items-center justify-between p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm w-full">
                              <div className="flex items-center space-x-2">
                                  <IconComponent size={20} className={item.color} />
                                  <span className="text-sm font-medium dark:text-gray-200">{iconValue}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                  <button 
                                      onClick={() => handleIconMove(index, -1)} 
                                      disabled={index === 0}
                                      className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 disabled:opacity-30" title="Move Up"
                                  >
                                      <ArrowUp size={16} />
                                  </button>
                                  <button 
                                      onClick={() => handleIconMove(index, 1)} 
                                      disabled={index === localIcons.length - 1}
                                      className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 disabled:opacity-30" title="Move Down"
                                  >
                                      <ArrowDown size={16} />
                                  </button>
                                  <span className="border-l dark:border-gray-600 h-5"></span>
                                  <button 
                                      onClick={() => { setEditingIconIndex(index); setShowIconEditor(true); }}
                                      className="text-blue-500 hover:text-blue-700" title="Edit Icon"
                                  >
                                      <Edit size={16} />
                                  </button>
                                  <button 
                                      onClick={() => handleIconDelete(index)}
                                      className="text-red-500 hover:text-red-700" title="Delete Icon"
                                  >
                                      <X size={16} />
                                  </button>
                              </div>
                          </div>
                      );
                  }).filter(Boolean)
              )}
          </div>

          <button 
            onClick={() => { setEditingIconIndex(null); setShowIconEditor(true); }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
          >
            <Plus size={18} className="mr-2" /> Add Icon
          </button>
        </div>
      )}
    </div>
  );
});


// --- Component: Cell Editor Modal ---
const CellEditor = ({ isOpen, onClose, dayData, onSave, isAdmin }) => {
  
  // --- CURSOR BUG FIX: Use local state for all inputs ---
  const [localText1, setLocalText1] = useState('');
  const [localText2, setLocalText2] = useState('');
  const [localColorId, setLocalColorId] = useState('none');
  const [localIcons, setLocalIcons] = useState([]);

  // Populate local state *only* when the modal is opened
  useEffect(() => {
    if (dayData) {
      setLocalText1(dayData.text1 || '');
      setLocalText2(dayData.text2 || '');
      setLocalColorId(dayData.colorId || 'none');
      // Handle legacy 'content' array if 'icons' is missing
      setLocalIcons(dayData.icons || dayData.content || []); 
    }
  }, [dayData]); // REWRITE: This dependency is now SAFE because the component is shielded

  // --- END CURSOR BUG FIX ---
  
  const [activeTab, setActiveTab] = useState('text'); 
  const [showIconEditor, setShowIconEditor] = useState(false);
  const [editingIconIndex, setEditingIconIndex] = useState(null);

  // Save handler sends local state back up
  const handleSave = () => {
    onSave({
      ...dayData,
      text1: localText1,
      text2: localText2,
      colorId: localColorId,
      icons: localIcons,
      isText1Bold: true, // Location is always bold now
      isText2Bold: false // Field removed
    });
    onClose();
  };
  
  // --- Icon Handlers (use local state) ---
  const handleIconSave = (iconData) => {
    setLocalIcons(prevIcons => {
        const newIcons = [...prevIcons];
        if (iconData.value === 'None') {
            if (editingIconIndex !== null) {
                // If editing, 'None' means delete
                newIcons.splice(editingIconIndex, 1);
            }
        } else if (editingIconIndex !== null) {
            newIcons[editingIconIndex] = { ...newIcons[editingIconIndex], ...iconData };
        } else {
            newIcons.push({ id: Date.now().toString(), ...iconData });
        }
        return newIcons;
    });
    setEditingIconIndex(null);
    setShowIconEditor(false);
  };
  
  const handleIconDelete = (index) => {
    setLocalIcons(prev => prev.filter((_, i) => i !== index));
  };

  const handleIconMove = (indexToMove, direction) => {
      const newIcons = [...localIcons];
      const newIndex = indexToMove + direction;
      if (newIndex < 0 || newIndex >= newIcons.length) return;
      [newIcons[indexToMove], newIcons[newIndex]] = [newIcons[newIndex], newIcons[indexToMove]];
      setLocalIcons(newIcons);
  };

  return (
    <div className={`fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity`}>
      {/* REWRITE: We check for dayData here to prevent crash, but the component is stable */}
      {dayData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
          <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {isAdmin ? 'Edit Day' : 'View Day'} - {dayData.month} {dayData.day}, {dayData.year}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          {/* REWRITE: Pass props to the new stable components */}
          {isAdmin ? (
            <RichTextEditor
              isAdmin={isAdmin} activeTab={activeTab} setActiveTab={setActiveTab}
              localText1={localText1} setLocalText1={setLocalText1}
              localText2={localText2} setLocalText2={setLocalText2}
              localColorId={localColorId} setLocalColorId={setLocalColorId}
              localIcons={localIcons}
              handleIconMove={handleIconMove}
              setEditingIconIndex={setEditingIconIndex}
              setShowIconEditor={setShowIconEditor}
              handleIconDelete={handleIconDelete}
            />
          ) : (
            <StaticView
              localText1={localText1}
              localText2={localText2}
              localIcons={localIcons}
            />
          )}

          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-end">
            {isAdmin && (
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <Save size={18} className="mr-2" /> Save Changes
              </button>
            )}
            {!isAdmin && (
              <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 font-bold py-2 px-4 rounded-lg transition-colors">
                Close
              </button>
            )}
          </div>
        </div>
      )} {/* This closes the dayData && check */}
      
      <IconEditor
        key={showIconEditor ? 'open' : 'closed'}
        isOpen={showIconEditor}
        onClose={() => setShowIconEditor(false)}
        onSave={handleIconSave}
        initialIconData={editingIconIndex !== null && localIcons[editingIconIndex] ? localIcons[editingIconIndex] : null}
      />
    </div>
  );
};

// REWRITE: Shield the CellEditor from parent re-renders
const CellEditorMemo = React.memo(CellEditor);


// --- Component: Authentication Modal (Triggered by button) ---
const AuthModal = ({ isOpen, onClose, onAuthenticate, isLoading, setIsLoading, authError }) => {
  const [password, setPassword] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
        setPassword('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission
    setIsLoading(true);
    
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
            onAuthenticate('view', null); // Ensure auth error is set
        }
    } catch (e) {
        console.error("Auth error:", e);
        onAuthenticate('view', null); // Ensure auth error is set
    } finally {
        setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X size={24} />
        </button>
      
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <Lock size={24} className="mr-2 text-blue-500" /> Calendar Settings
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Enter the admin password to access settings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter Password"
              disabled={isLoading}
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader size={20} className="animate-spin" /> : <LogIn size={20} />}
            <span className="ml-2">{isLoading ? 'Checking...' : 'Authenticate'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Component: Key Editor Modal ---
const KeyEditor = ({ isOpen, onClose, keyData, onSave }) => {
    if (!isOpen) return null;

    const [localKeyItems, setLocalKeyItems] = useState(keyData);
    // NEW: State to manage the Icon Editor modal
    const [showIconEditor, setShowIconEditor] = useState(false);
    const [editingKeyId, setEditingKeyId] = useState(null);
    
    const handleAddRow = () => {
        setLocalKeyItems(prev => [...prev, { id: Date.now().toString(), label: 'New Item', icon: 'None', iconColor: KEY_COLOR_OPTIONS[0].class, isColorKey: false }]);
    };
    
    // FIX: Simplified filter logic. The button is already disabled for the color key.
    const handleDeleteRow = (id) => {
        setLocalKeyItems(prev => prev.filter(item => item.id !== id));
    };
    
    const handleChange = (id, field, value) => {
        setLocalKeyItems(prev => prev.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        ));
    };
    
    const handleSaveKey = () => {
        onSave(localKeyItems);
        onClose();
    };
    
    const handleKeyMove = (indexToMove, direction) => {
        const newIndex = indexToMove + direction;

        if (newIndex < 0 || newIndex >= localKeyItems.length) return;
        if (localKeyItems[indexToMove].isColorKey || localKeyItems[newIndex].isColorKey) return; 

        const newItems = [...localKeyItems];
        [newItems[indexToMove], newItems[newIndex]] = [newItems[newIndex], newItems[indexToMove]];
        
        setLocalKeyItems(newItems);
    };

    // NEW: Handler for saving data from the IconEditor
    const handleIconSave = (iconData) => {
        // iconData is { type: 'icon', value: iconType, color: iconColor }
        if (editingKeyId) {
            handleChange(editingKeyId, 'icon', iconData.value);
            handleChange(editingKeyId, 'iconColor', iconData.color);
        }
        setShowIconEditor(false);
        setEditingKeyId(null);
    };

    // NEW: Get the item being edited to pass to the IconEditor
    const itemToEdit = editingKeyId ? localKeyItems.find(item => item.id === editingKeyId) : null;
    const iconEditorInitialData = itemToEdit ? { value: itemToEdit.icon, color: itemToEdit.iconColor } : null;

    return (
      <div className={`fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity`}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl p-6 space-y-6 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center"><Edit size={20} className="mr-2"/> Edit Calendar Key</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><X size={24} /></button>
          </div>
            
          <p className="text-sm text-gray-600 dark:text-gray-300">The "Away From Home" item is locked to the top.</p>
            
          <div className="space-y-4">
            {localKeyItems.map((item, index) => {
                const color = COLOR_OPTIONS.find(c => c.id === item.id);
                const IconComponent = ICON_MAP[item.icon];
                
                const bgColorClass = color ? color.class.split(' ').filter(cls => cls.startsWith('bg-')).join(' ') : 'bg-gray-100';

                return (
                    <div key={item.id} className="flex items-center space-x-2 border-b dark:border-gray-700 pb-3">
                        <div className="flex flex-col">
                            <button 
                                onClick={() => handleKeyMove(index, -1)} 
                                disabled={index === 0 || item.isColorKey || (index > 0 && localKeyItems[index - 1].isColorKey)}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 disabled:opacity-30" title="Move Up"
                            >
                                <ArrowUp size={16} />
                            </button>
                            <button 
                                onClick={() => handleKeyMove(index, 1)} 
                                disabled={index === localKeyItems.length - 1 || item.isColorKey}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 disabled:opacity-30" title="Move Down"
                            >
                                <ArrowDown size={16} />
                            </button>
                        </div>

                        {/* REWRITE: This is now a button to open the Icon Editor */}
                        <button
                          onClick={() => {
                            if (!item.isColorKey) { // Don't allow changing the color-key icon
                              setEditingKeyId(item.id);
                              setShowIconEditor(true);
                            }
                          }}
                          className={`w-16 h-10 rounded-lg ${bgColorClass} flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 ${item.isColorKey ? 'cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                          disabled={item.isColorKey}
                        >
                          {IconComponent && item.icon !== 'None' ? (
                            <IconComponent size={20} className={item.iconColor || 'text-gray-900'} />
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">Set</span>
                          )}
                        </button>

                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleChange(item.id, 'label', e.target.value)}
                          className="p-2 border rounded-lg flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Label (e.g., Away From Home)"
                        />
                        
                        {/* The two <select> dropdowns for icon and color have been removed. */}
                        
                        <button 
                          onClick={() => handleDeleteRow(item.id)} 
                          className={`text-red-500 hover:text-red-700 ${item.isColorKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={item.isColorKey}
                        >
                            <X size={20} />
                        </button>
                    </div>
                );
            })}
          </div>
            
          <div className="flex justify-between pt-4 border-t dark:border-gray-700">
            <button onClick={handleAddRow} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                <Plus size={18} className="mr-2" /> Add Key Item
            </button>
            <button onClick={handleSaveKey} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                <Save size={18} className="mr-2" /> Save Key
            </button>
          </div>
        </div>

        {/* NEW: Add the IconEditor, which is controlled by this component's state */}
        <IconEditor
          key={showIconEditor ? 'key-editor-open' : 'key-editor-closed'}
          isOpen={showIconEditor}
          onClose={() => setShowIconEditor(false)}
          onSave={handleIconSave}
          initialIconData={iconEditorInitialData}
        />
      </div>
    );
};

// --- Component: Main App ---
export default function App() {
  
  // --- Config State (from Server) ---
  const [config, setConfig] = useState({
    timezone: 'UTC',
    title: 'Calendar',
    headerName: null // Will be set to year + 'Calendar'
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // --- Production Auth Flow ---
  const [role, setRole] = useState('view');
  const [adminToken, setAdminToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  const [calendarData, setCalendarData] = useState(null); // BUG FIX: Initialize as null
  const [isSaving, setIsSaving] =useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true); // Start loading
  const [activeCell, setActiveCell] = useState(null); 
  const [showKeyEditor, setShowKeyEditor] = useState(false);
  const [keyItems, setKeyItems] = useState(DEFAULT_KEY_ITEMS); // Use default
  const [lastUpdatedText, setLastUpdatedText] = useState('');
  const [year, setYear] = useState(new Date().getFullYear()); // Default, will be overwritten by config
  
  // API Connection State
  const [apiError, setApiError] = useState(null);
  const wsRef = useRef(null);

  // --- Dark Mode Effect ---
  useEffect(() => {
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
    } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
      setIsDarkMode(prevMode => {
          const newMode = !prevMode;
          if (newMode) {
              document.documentElement.classList.add('dark');
              localStorage.setItem('theme', 'dark');
          } else {
              document.documentElement.classList.remove('dark');
              localStorage.setItem('theme', 'light');
          }
          return newMode;
      });
  };

  // --- API and WebSocket Persistence ---

  // 1. Fetch Config on initial load
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (!response.ok) throw new Error('Failed to load config');
        const appConfig = await response.json();
        
        // Set year based on timezone
        let initialYear = new Date().getFullYear();
        try {
            const now = new Date(new Date().toLocaleString('en-US', { timeZone: appConfig.timezone }));
            initialYear = now.getFullYear();
        } catch (e) {
            console.warn(`Invalid timezone '${appConfig.timezone}'. Falling back to UTC.`);
            const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'UTC' }));
            initialYear = now.getFullYear();
            appConfig.timezone = 'UTC'; // Force fallback
        }
        
        setYear(initialYear);
        setConfig(appConfig);

      } catch (e) {
        console.error("Failed to fetch config:", e);
        // App will run with defaults
        const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'UTC' }));
        setYear(now.getFullYear());
      }
    };
    fetchConfig();
  }, []); // Run only once on mount

  // 2. WebSocket Setup
  useEffect(() => {
    const getWebSocketURL = () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}`;
    };

    const wsURL = getWebSocketURL();
    if (!wsURL) {
        console.error("Could not determine WebSocket URL.");
        setApiError("Failed to initialize connection.");
        return;
    }

    const connectWebSocket = () => {
        wsRef.current = new WebSocket(wsURL);

        wsRef.current.onopen = () => {
            console.log('WebSocket connected');
            setApiError(null);
        };

        wsRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'DATA_UPDATE') {
                const updatedData = message.payload.data;
                const updatedYear = message.payload.year;

                // Use functional state update to ensure we're updating based on the *current* year
                setYear(currentYear => {
                    if (updatedYear === currentYear) {
                        console.log('Received real-time update for current year:', updatedYear);
                        setCalendarData(updatedData.dayData);
                        setKeyItems(updatedData.keyItems);
                        setLastUpdatedText(updatedData.lastUpdatedText);
                    } else {
                        console.log('Received real-time update for different year, ignoring.');
                    }
                    return currentYear; // Return the unchanged year
                });
            }
        };

        wsRef.current.onclose = () => {
            console.log('WebSocket disconnected. Reconnecting...');
            if (apiError === null) {
              setApiError("Connection Lost. Reconnecting...");
            }
            // Use a unique timeout ID to prevent multiple reconnect loops
            const timeoutId = setTimeout(connectWebSocket, 3000);
            wsRef.current.timeoutId = timeoutId;
        };

        wsRef.current.onerror = (err) => {
            console.error('WebSocket Error:', err);
            setApiError("Error connecting to server.");
            wsRef.current.close(); // This will trigger the onclose reconnect logic
        };
    };

    connectWebSocket();

    // Cleanup on component unmount
    return () => {
        if (wsRef.current) {
            if (wsRef.current.timeoutId) {
                clearTimeout(wsRef.current.timeoutId); // Clear reconnect timeout
            }
            wsRef.current.onclose = null; // Prevent reconnect on unmount
            wsRef.current.close();
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount


  // 3. Data Loading
  const fetchData = useCallback(async (currentYear) => {
    setIsDataLoading(true);
    setApiError(null);
    try {
        const response = await fetch(`/api/data/${currentYear}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (Object.keys(data).length === 0 || !data.dayData) {
            console.log(`No data for ${currentYear}. Initializing...`);
            const defaultData = {
                dayData: generateCalendarForYear(currentYear),
                keyItems: DEFAULT_KEY_ITEMS,
                lastUpdatedText: '',
            };
            setCalendarData(defaultData.dayData);
            setKeyItems(defaultData.keyItems);
            setLastUpdatedText(defaultData.lastUpdatedText);
        } else {
            setCalendarData(data.dayData);
            setKeyItems(data.keyItems);
            setLastUpdatedText(data.lastUpdatedText);
        }
    } catch (e) {
        console.error(`Error fetching data for ${currentYear}:`, e);
        setApiError("Failed to load calendar data.");
        setCalendarData({}); // Set to empty object on error to stop loading
    } finally {
        setIsDataLoading(false);
    }
  }, []);

  // Load data when the year changes
  useEffect(() => {
      fetchData(year);
  }, [year, fetchData]);

  // --- Set Page Title ---
  useEffect(() => {
    if (year) {
      document.title = `${year} Calendar`;
    }
  }, [year]);
  
  // 4. Data Saving (Debounced for LastUpdatedText)
  const debouncedSaveRef = useRef(null);

  const saveData = useCallback(async (dataToSave) => {
    if (role !== 'admin' || !adminToken) {
        console.warn("Save blocked: Not an admin or no token.");
        return; 
    }
    
    setIsSaving(true);
    setApiError(null);
    try {
        const response = await fetch(`/api/data/${year}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(dataToSave)
        });

        if (!response.ok) {
          if (response.status === 401) {
              setApiError("Admin session expired. Please log in again.");
              handleLogout(); // Force logout
          } else {
              throw new Error(`Failed to save: ${response.statusText}`);
          }
        }
        
    } catch (e) {
        console.error("Failed to save data:", e);
        setApiError("Failed to save data.");
    } finally {
        setTimeout(() => setIsSaving(false), 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, adminToken, year]); // handleLogout is stable

  // --- Event Handlers ---

  const handleDayUpdate = useCallback((dayKey, updatedDayData) => {
    if (role !== 'admin' || !calendarData) return;
    
    updatedDayData.year = parseInt(dayKey.split('-')[0], 10);

    const newDayData = { ...calendarData, [dayKey]: updatedDayData };
    setCalendarData(newDayData);
    
    const newTimestamp = new Date().toLocaleDateString();
    setLastUpdatedText(newTimestamp);
    saveData({ dayData: newDayData, keyItems, lastUpdatedText: newTimestamp });
  }, [calendarData, saveData, keyItems, lastUpdatedText, role, setLastUpdatedText]);

  const handleLastUpdatedTextChange = (e) => {
    const newText = e.target.value;
    setLastUpdatedText(newText);
    
    if (debouncedSaveRef.current) {
      clearTimeout(debouncedSaveRef.current);
    }
    
    debouncedSaveRef.current = setTimeout(() => {
      // Use functional state update to get latest calendarData
      setCalendarData(currentCalendarData => {
        saveData({ dayData: currentCalendarData, keyItems, lastUpdatedText: newText });
        return currentCalendarData;
      });
    }, 800);
  };

  const handleAuthentication = (userRole, token) => {
    setRole(userRole);
    setAdminToken(token);
    setAuthError(null); // Clear error on success
    
    if (userRole === 'admin') {
        // Check if calendar data is empty (e.g., first run)
        if (calendarData && Object.keys(calendarData).length === 0) {
            const defaultData = {
                dayData: generateCalendarForYear(year),
                keyItems: DEFAULT_KEY_ITEMS,
                lastUpdatedText: '',
            };
            setCalendarData(defaultData.dayData);
            setKeyItems(defaultData.keyItems);
            setLastUpdatedText(defaultData.lastUpdatedText);
            // Save the newly generated default data
            // We need to pass the token *directly* because state update might not be instant
            saveData(defaultData, token); 
        }
    } else {
        // This handles the case where login fails
        setAuthError("Incorrect admin password.");
    }
  };
  
  const handleLogout = () => {
      setRole('view');
      setAdminToken(null);
  };

  const handleCellClick = (dayKey) => {
    if (calendarData[dayKey]) {
      setActiveCell(dayKey);
    }
  };

  const handleCellEditorSave = (updatedDayData) => {
    handleDayUpdate(activeCell, updatedDayData);
    setActiveCell(null);
  };
  
  const handleKeyUpdate = (newKeyItems) => {
      setKeyItems(newKeyItems);
      const newTimestamp = new Date().toLocaleDateString();
      setLastUpdatedText(newTimestamp);
      saveData({ dayData: calendarData, keyItems: newKeyItems, lastUpdatedText: newTimestamp });
  };
  
  const getTotalDaysInYear = (y) => {
    return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0) ? 366 : 365;
  };

  // 6. Calculations (Monthly & Yearly Totals)
  const calculatedTotals = useMemo(() => {
    if (!calendarData) return { monthly: {}, yearlyTotal: 0, yearlyPercentage: 0, totalDays: 0 };
    
    const totals = {};
    let yearlyTotal = 0;
    const totalDays = getTotalDaysInYear(year); 

    for (const key in calendarData) {
      const day = calendarData[key];
      const monthName = day.month;

      if (!totals[monthName]) {
        totals[monthName] = { highlighted: 0, total: 0 };
      }

      totals[monthName].total++;
      if (day.colorId !== 'none') {
        totals[monthName].highlighted++;
        yearlyTotal++;
      }
    }

    for (const month in totals) {
      totals[month].percentage = Math.round((totals[month].highlighted / totals[month].total) * 100);
    }
    
    const yearlyPercentage = totalDays > 0 ? Math.round((yearlyTotal / totalDays) * 100) : 0;

    return { monthly: totals, yearlyTotal, yearlyPercentage, totalDays };
  }, [calendarData, year]);
  

  // --- Today's Date (Timezone Aware) ---
  const todayKey = useMemo(() => {
    try {
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: config.timezone }));
      return createDateKey(now.getFullYear(), now.getMonth(), now.getDate());
    } catch (e) {
      // This catch block handles the initial render before config is loaded
      const now = new Date();
      return createDateKey(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    }
  }, [config.timezone]);


  // BUG FIX: Show loader if data is loading OR if calendarData is null
  if (isDataLoading || !calendarData) {
       return (
          <div className="min-h-screen bg-gray-200 dark:bg-gray-900 flex flex-col items-center justify-center">
            <Loader size={48} className="animate-spin text-blue-500" />
            <div className="text-xl font-medium text-gray-700 dark:text-gray-300 mt-4">Loading Calendar Data for {year}...</div>
          </div>
        );
  }

  // --- Component Rendering ---
  const activeCellData = activeCell ? calendarData[activeCell] : null;
  const headerPrefix = config.headerName ? `Where is ${config.headerName} in` : 'Calendar';
  const headerYear = year;

  // Helper to render one month's table
  const renderMonth = (monthIndex) => {
    const monthName = MONTHS[monthIndex];
    const isCurrentYear = new Date(new Date().toLocaleString('en-US', { timeZone: config.timezone })).getFullYear() === year;

    const firstDayOfMonth = new Date(Date.UTC(year, monthIndex, 1));
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const startingDay = firstDayOfMonth.getUTCDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(<td key={`pad-${monthName}-${i}`} className="p-1 sm:p-2 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"></td>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayKey = createDateKey(year, monthIndex, i);
      const dayInfo = calendarData[dayKey];
      
      // BUG FIX: Check if dayInfo exists
      if (!dayInfo) {
        days.push(<td key={`missing-${i}`} className="p-1 sm:p-2 border border-gray-200 dark:border-gray-700 h-28 bg-red-100 dark:bg-red-900/50">?</td>);
        continue;
      }
      
      const color = COLOR_OPTIONS.find(c => c.id === dayInfo.colorId);
      const colorClass = color ? color.class.split(' ').filter(cls => cls.startsWith('bg-') || cls.startsWith('dark:bg-')).join(' ') : 'bg-white dark:bg-gray-800';
      
      const isToday = isCurrentYear && dayKey === todayKey;
      const isHighlighted = dayInfo.colorId !== 'none';
      const dayNumberColor = isHighlighted ? 'text-gray-900' : 'text-gray-800 dark:text-gray-100';
      const locationTextColor = isHighlighted ? 'text-gray-800' : 'text-gray-700 dark:text-gray-300';
      
      const cellClasses = `p-0.5 sm:p-1 border border-gray-200 dark:border-gray-700 h-28 w-1/7 cursor-pointer transition-shadow ${colorClass}`;
      
      // Combine legacy 'content' and new 'icons'
      const iconsToDisplay = (dayInfo.icons || dayInfo.content || []).filter(item => (item.type === 'icon' || item.value)); // Handle both formats

      days.push(
      <td 
        key={dayKey} 
        className={cellClasses} // This className (with h-28) stays the same
        onClick={() => handleCellClick(dayKey)}
        >
        <div className="h-full flex flex-col justify-between p-1">

            {/* This is your Top Block (Date + Location) */}
            <div className="text-xs font-semibold text-center flex flex-col items-center">
                <span className={`text-lg font-bold ${isToday ? 'bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center' : dayNumberColor}`}>{dayInfo.day}</span> 
                
                {dayInfo.text1 && (
                    <span className={`block text-base font-bold mt-1 ${locationTextColor} break-words line-clamp-2`}>
                        {dayInfo.text1}
                    </span>
                )}
            </div>
            {/* This is your Bottom Block (Icons) 
                - Using flex-nowrap to encourage shrinking before wrapping
                - Removed space-y-1, it's not needed if we are using flex-nowrap
            */}

            <div className="flex flex-wrap justify-center items-end">
                {iconsToDisplay.slice(0, 3).map((item, index) => {
                    const iconValue = item.value || item.icon;
                    if (ICON_MAP[iconValue] && iconValue !== 'None') {
                    const IconComponent = ICON_MAP[iconValue];
                    
                    // NEW LOGIC: Use a wrapping div to manage width and padding
                    const containerClasses = 'w-1/2 p-0';
                            
                    // Size is fixed to 20, but it will scale to fit the container
                    const size = 20; 

                    const isYellow = item.color === 'text-yellow-500';
                    const isCellOrange = dayInfo.colorId === 'orange';
                    const shadowClass = (isYellow && isCellOrange)
                        ? '[filter:drop-shadow(0px_0px_1px_rgba(0,0,0,0.9))]'
                        : '';
                    
                    return (
                        <div key={item.id || index} className={`flex items-center justify-center ${containerClasses}`}>
                        <IconComponent
                            size={size} // Fixed at 20
                            className={`${item.color} w-full h-full ${shadowClass}`} // Conditionally adds the shadow
                        />
                        </div>
                    );
                    }
                    return null;
                }).filter(Boolean)}
            </div>
        </div>
      </td>
      );
    }

    const rows = [];
    let currentRow = [];
    days.forEach((cell, index) => {
      currentRow.push(cell);
      if (currentRow.length === 7) {
        rows.push(<tr key={`row-${rows.length}`} className="h-full">{currentRow}</tr>);
        currentRow = [];
      }
    });
    if (currentRow.length > 0) {
      while (currentRow.length < 7) {
        currentRow.push(<td key={`pad-end-${monthName}-${currentRow.length}`} className="p-1 sm:p-2 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"></td>);
      }
      rows.push(<tr key={`row-${rows.length}`} className="h-full">{currentRow}</tr>);
    }
    
    const monthStats = calculatedTotals.monthly[monthName];

    return (
      <div key={monthName} className="w-full lg:w-1/3 p-2">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 mt-4 flex justify-between items-center">
            {monthName}
            {monthStats && <span className="text-sm font-normal bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">{monthStats.highlighted} / {monthStats.total} days ({monthStats.percentage}%)</span>}
        </h2>
        <table className="calendar-table w-full table-fixed border-collapse border border-gray-300 dark:border-gray-700 shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <th key={day} className="p-2 border border-gray-300 dark:border-gray-600">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800">
            {rows}
          </tbody>
        </table>
      </div>
    );
  };
  
  // --- Main Application Render ---
  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      
      {apiError && (
        <div className="sticky top-0 z-[60] bg-red-600 text-white p-3 text-center font-bold flex items-center justify-center shadow-lg">
            <CloudOff size={18} className="mr-2" />
            {apiError}
        </div>
      )}

      <div className="max-w-screen-2xl xl:max-w-screen-2xl mx-auto p-4 sm:p-6">
        <header className="mb-8 border-b dark:border-gray-700 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center sm:text-left">
                {headerPrefix}
                {/* Apply contrasting color classes for visibility in both themes */}
                <span className="text-blue-600 dark:text-blue-600 font-black ml-2 mr-1">
                    {headerYear}
                </span>
                {config.headerName ? '?' : ''}
            </h1>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0 flex-wrap justify-center">
                
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                    <button onClick={() => setYear(year - 1)} className="p-1 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"><ChevronLeft size={20} /></button>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Year: {year}</span>
                    <button onClick={() => setYear(year + 1)} className="p-1 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"><ChevronRight size={20} /></button>
                </div>

                <button 
                    onClick={toggleDarkMode} 
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Toggle Dark Mode"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {role === 'admin' && (
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/50 dark:text-red-300 text-red-700">
                        ADMIN MODE
                    </span>
                )}
                
                {role === 'admin' ? (
                    <>
                        <button onClick={() => setShowKeyEditor(true)} className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded-lg flex items-center transition-colors">
                            <Edit size={16} className="mr-1" /> Edit Key
                        </button>
                        <button onClick={handleLogout} className="bg-gray-500 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded-lg flex items-center transition-colors">
                            <LogOut size={16} className="mr-1" /> Logout
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => { setShowAuthModal(true); setAuthError(null); }} 
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                        title="Settings" // Added title for accessibility
                    >
                        <Settings size={18} />
                    </button>
                )}
                
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center">
            <span className="mr-2">Last updated:</span>
            <span className="font-semibold">{lastUpdatedText}</span>
            {isSaving && <span className="ml-2 text-xs text-blue-500 flex items-center"><Loader size={12} className="mr-1 animate-spin"/> Saving...</span>}
          </p>
        </header>

        <section className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Key</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                {keyItems.map(item => {
                    const color = COLOR_OPTIONS.find(c => c.id === item.id);
                    const IconComponent = ICON_MAP[item.icon];
                    
                    const bgColorClass = color ? color.class.split(' ').filter(cls => cls.startsWith('bg-')).join(' ') : 'bg-gray-100 dark:bg-gray-700';

                    return (
                        <div key={item.id} className="flex items-center space-x-3 p-2 border dark:border-gray-700 rounded-lg">
                            <div className={`w-5 h-5 rounded-full ${bgColorClass} flex items-center justify-center border border-gray-300 dark:border-gray-600`}>
                                {IconComponent && item.icon !== 'None' && <IconComponent size={14} className={item.iconColor || 'text-gray-900'} />}
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                        </div>
                    );
                })}
            </div>
        </section>
        
        <section className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{year} Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold">Days Away from Home</p>
                    <p className="text-3xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">{calculatedTotals.yearlyTotal} days</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold">Time Away From Home</p>
                    <p className="text-3xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">{calculatedTotals.yearlyPercentage}%</p>
                </div>
            </div>
        </section>


        <div className="flex flex-wrap -m-2">
          {/* BUG FIX: Was {MONTHS.map((month, index) => renderMonth(month, index))} */}
          {/* Changed to pass index only */}
          {MONTHS.map((_, index) => renderMonth(index))}
        </div>
      </div>
      
      {/* Modals */}
      <CellEditor
        key={activeCell}
        isOpen={!!activeCell}
        onClose={() => setActiveCell(null)}
        dayData={activeCell ? calendarData[activeCell] : null}
        onSave={handleCellEditorSave}
        isAdmin={role === 'admin'}
      />
      
      <KeyEditor
        isOpen={showKeyEditor}
        onClose={() => setShowKeyEditor(false)}
        keyData={keyItems}
        onSave={handleKeyUpdate}
      />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {setShowAuthModal(false); setAuthError(null);}}
        onAuthenticate={handleAuthentication}
        isLoading={authLoading}
        authError={authError}
        setIsLoading={setAuthLoading}
      />
    </div>
  );
}
