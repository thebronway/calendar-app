import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface EditorLocationsProps {
  localLocations: string;
  setLocalLocations: (val: string) => void;
}

export const EditorLocations: React.FC<EditorLocationsProps> = ({ localLocations, setLocalLocations }) => {
  const [locationInput, setLocationInput] = useState('');

  useEffect(() => {
    setLocationInput('');
  }, [localLocations]);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const currentLocs = localLocations.split(',').map(l => l.trim()).filter(Boolean);
    const draggedLoc = currentLocs[dragItem.current];
    currentLocs.splice(dragItem.current, 1);
    currentLocs.splice(dragOverItem.current, 0, draggedLoc);
    setLocalLocations(currentLocs.join(', '));
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleAddLocation = () => {
    const newLoc = locationInput.trim();
    if (newLoc) {
      const currentLocs = localLocations.split(',').map(l => l.trim()).filter(Boolean);
      if (!currentLocs.includes(newLoc)) {
        setLocalLocations([...currentLocs, newLoc].join(', '));
      }
      setLocationInput('');
    }
  };

  return (
    <div className="shrink-0">
      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Locations</h4>
      <div className="flex flex-wrap gap-2 p-2 w-full border rounded-lg dark:bg-gray-900 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 bg-white transition-shadow cursor-text" onClick={() => document.getElementById('location-input')?.focus()}>
        {localLocations.split(',').map(l => l.trim()).filter(Boolean).map((loc, index) => (
          <span 
            key={index} 
            draggable
            onDragStart={() => { dragItem.current = index; }}
            onDragEnter={() => { dragOverItem.current = index; }}
            onDragEnd={handleSort}
            onDragOver={(e) => e.preventDefault()}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 rounded-md text-sm font-bold cursor-grab active:cursor-grabbing"
          >
            {loc}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const currentLocs = localLocations.split(',').map(l => l.trim()).filter(Boolean);
                setLocalLocations(currentLocs.filter(l => l !== loc).join(', '));
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-100 p-0.5 rounded-sm hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          id="location-input"
          type="text"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          onBlur={handleAddLocation}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              handleAddLocation();
            } else if (e.key === 'Backspace' && locationInput === '') {
              e.preventDefault();
              const currentLocs = localLocations.split(',').map(l => l.trim()).filter(Boolean);
              if (currentLocs.length > 0) {
                currentLocs.pop();
                setLocalLocations(currentLocs.join(', '));
              }
            }
          }}
          className="flex-1 min-w-[140px] bg-transparent outline-none text-sm font-bold dark:text-white placeholder-gray-400 py-1"
          placeholder={localLocations.split(',').filter(Boolean).length === 0 ? "Type a location and press Enter..." : ""}
        />
      </div>
    </div>
  );
};