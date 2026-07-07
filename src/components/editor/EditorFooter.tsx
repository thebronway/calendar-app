import React from 'react';
import { ArrowLeft, ArrowRight, Save, Trash2, X } from 'lucide-react';

interface EditorFooterProps {
  isAdmin: boolean;
  isBulkEdit: boolean;
  onSave: (nextAction?: 'prev' | 'next' | 'close') => void;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  onClearAll?: () => void;
}

export const EditorFooter: React.FC<EditorFooterProps> = ({ isAdmin, isBulkEdit, onSave, onClose, onNavigate, onClearAll }) => {
  if (isBulkEdit) {
    return (
      <div className="p-4 bg-theme-item border-t border-theme-item flex justify-end space-x-3 shrink-0 rounded-b-xl">
        <button onClick={onClose} className="bg-theme-panel hover:bg-theme-item-hover text-theme-text py-2 px-4 rounded-lg font-bold transition-colors border border-theme-grid-divider">
          Cancel
        </button>
        <button onClick={() => onSave('close')} className="bg-theme-accent hover:opacity-90 text-theme-accent-text font-bold py-2 px-4 rounded-lg flex items-center shadow-sm transition-colors">
          <Save size={18} className="mr-2" /> Save All
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-4 bg-theme-item border-t border-theme-item flex items-stretch justify-between shrink-0 rounded-b-xl gap-2">
        <button onClick={() => onNavigate?.('prev')} className="bg-theme-panel hover:bg-theme-item-hover text-theme-accent border border-theme-grid-divider py-2 px-3 sm:px-4 rounded-lg font-bold flex items-center transition-colors shrink-0 justify-center shadow-sm" title="Previous">
          <ArrowLeft size={18} className="sm:mr-2" /> <span className="hidden sm:inline">Previous</span>
        </button>
        <button onClick={onClose} className="bg-theme-panel hover:bg-theme-item-hover text-theme-text border border-theme-grid-divider py-2 px-4 sm:px-6 rounded-lg font-bold flex items-center justify-center transition-colors shadow-sm flex-1 sm:flex-none" title="Close">
          <X size={18} className="sm:mr-1.5" />
          <span className="hidden sm:inline">Close</span>
        </button>
        <button onClick={() => onNavigate?.('next')} className="bg-theme-panel hover:bg-theme-item-hover text-theme-accent border border-theme-grid-divider py-2 px-3 sm:px-4 rounded-lg font-bold flex items-center transition-colors shrink-0 justify-center shadow-sm" title="Next">
          <span className="hidden sm:inline">Next</span> <ArrowRight size={18} className="sm:ml-2" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-theme-item border-t border-theme-item flex items-stretch justify-between shrink-0 rounded-b-xl gap-2">
      <button onClick={() => onSave('prev')} className="bg-theme-accent-secondary hover:opacity-90 text-white py-2 px-3 sm:px-4 rounded-lg font-bold flex items-center transition-colors shrink-0 justify-center shadow-sm" title="Save & Previous">
        <ArrowLeft size={18} className="sm:mr-2" />
        <Save size={16} className="hidden sm:block mr-1.5 opacity-90" />
        <div className="hidden sm:flex flex-col items-start leading-none text-left">
          <span className="text-[10px] uppercase opacity-90 mb-0.5">Save &</span>
          <span>Previous</span>
        </div>
      </button>
      
      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 py-2 px-2 sm:px-4 rounded-lg font-bold flex items-center justify-center transition-colors text-sm shadow-sm flex-1 sm:flex-none"
          title="Clear all fields for this day"
        >
          <Trash2 size={16} className="sm:mr-1.5" />
          <span className="hidden sm:inline">Clear Day</span>
        </button>
      )}

      <button onClick={() => onSave('close')} className="bg-theme-accent hover:opacity-90 text-theme-accent-text py-2 px-4 sm:px-6 rounded-lg font-bold flex items-center justify-center flex-1 sm:flex-none transition-colors shadow-sm" title="Save & Close">
        <Save size={18} className="sm:mr-2 opacity-90" />
        <div className="hidden sm:flex flex-col items-center leading-none">
          <span className="text-[10px] uppercase opacity-90 mb-0.5">Save &</span>
          <span>Close</span>
        </div>
      </button>
      
      <button onClick={() => onSave('next')} className="bg-theme-accent-secondary hover:opacity-90 text-white py-2 px-3 sm:px-4 rounded-lg font-bold flex items-center transition-colors shrink-0 justify-center shadow-sm" title="Save & Next">
        <div className="hidden sm:flex flex-col items-end leading-none text-right">
          <span className="text-[10px] uppercase opacity-90 mb-0.5">Save &</span>
          <span>Next</span>
        </div>
        <Save size={16} className="hidden sm:block ml-1.5 opacity-90" />
        <ArrowRight size={18} className="sm:ml-2" />
      </button>
    </div>
  );
};