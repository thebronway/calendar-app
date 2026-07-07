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
      <h4 className="text-sm font-bold text-theme-text-secondary uppercase tracking-widest mb-3">Locations</h4>
      <div className="flex flex-wrap gap-2 p-2 w-full border border-theme-item rounded-lg bg-theme-item focus-within:border-theme-accent focus-within:ring-1 focus-within:ring-theme-accent transition-shadow cursor-text" onClick={() => document.getElementById('location-input')?.focus()}>
        {localLocations.split(',').map(l => l.trim()).filter(Boolean).map((loc, index) => (
          <span 
            key={index} 
            draggable
            onDragStart={() => { dragItem.current = index; }}
            onDragEnter={() => { dragOverItem.current = index; }}
            onDragEnd={handleSort}
            onDragOver={(e) => e.preventDefault()}
            className="flex items-center gap-1 px-2.5 py-1 bg-theme-panel border border-theme-grid-divider text-theme-text rounded-md text-sm font-bold cursor-grab active:cursor-grabbing shadow-sm"
          >
            {loc}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const currentLocs = localLocations.split(',').map(l => l.trim()).filter(Boolean);
                setLocalLocations(currentLocs.filter(l => l !== loc).join(', '));
              }}
              className="text-theme-text-secondary hover:text-red-500 p-0.5 rounded-sm transition-colors"
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
          className="flex-1 min-w-[140px] bg-transparent outline-none text-sm font-bold text-theme-text placeholder-theme-text-secondary py-1"
          placeholder={localLocations.split(',').filter(Boolean).length === 0 ? "Type a location and press Enter..." : ""}
        />
      </div>
    </div>
  );
};