import React from 'react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

interface EditorFooterProps {
  isAdmin: boolean;
  isBulkEdit: boolean;
  onSave: (nextAction?: 'prev' | 'next' | 'close') => void;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export const EditorFooter: React.FC<EditorFooterProps> = ({ isAdmin, isBulkEdit, onSave, onClose, onNavigate }) => {
  if (isBulkEdit) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-end space-x-3 shrink-0 rounded-b-xl">
        <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg font-bold transition-colors">
          Cancel
        </button>
        <button onClick={() => onSave('close')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm transition-colors">
          <Save size={18} className="mr-2" /> Save All
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex items-center justify-between shrink-0 rounded-b-xl gap-2">
        <button onClick={() => onNavigate?.('prev')} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 py-2 px-3 sm:px-4 rounded-lg font-bold flex items-center transition-colors flex-1 sm:flex-none justify-center shadow-sm">
          <ArrowLeft size={18} className="sm:mr-2" /> <span className="hidden sm:inline">Previous</span>
        </button>
        <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-6 rounded-lg font-bold flex items-center transition-colors shadow-sm">
          Close
        </button>
        <button onClick={() => onNavigate?.('next')} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 py-2 px-3 sm:px-4 rounded-lg font-bold flex items-center transition-colors flex-1 sm:flex-none justify-center shadow-sm">
          <span className="hidden sm:inline">Next</span> <ArrowRight size={18} className="sm:ml-2" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex items-center justify-between shrink-0 rounded-b-xl gap-2">
      <button onClick={() => onSave('prev')} className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-3 sm:px-4 rounded-lg font-bold flex items-center transition-colors flex-1 sm:flex-none justify-center shadow-sm">
        <ArrowLeft size={18} className="sm:mr-2" />
        <Save size={16} className="hidden sm:block mr-1.5 opacity-90" />
        <div className="hidden sm:flex flex-col items-start leading-none text-left">
          <span className="text-[10px] uppercase opacity-90 mb-0.5">Save &</span>
          <span>Previous</span>
        </div>
      </button>
      
      <button onClick={() => onSave('close')} className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg font-bold flex items-center justify-center flex-1 sm:flex-none transition-colors shadow-sm">
        <Save size={18} className="mr-2 hidden sm:block opacity-90" />
        <div className="flex flex-col items-center leading-none">
          <span className="text-[10px] uppercase opacity-90 mb-0.5 hidden sm:block">Save &</span>
          <span>Close</span>
        </div>
      </button>
      
      <button onClick={() => onSave('next')} className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-3 sm:px-4 rounded-lg font-bold flex items-center transition-colors flex-1 sm:flex-none justify-center shadow-sm">
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