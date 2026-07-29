import React from 'react';
import ReactQuill from 'react-quill';
import { QUILL_MODULES } from '../../utils/constants';

interface EditorNotesProps {
  localDetails: string;
  setLocalDetails: (val: string) => void;
  isBulkEdit?: boolean;
  bulkEnabled?: boolean;
  onBulkToggle?: () => void;
}

export const EditorNotes: React.FC<EditorNotesProps> = ({ localDetails, setLocalDetails, isBulkEdit, bulkEnabled, onBulkToggle }) => {
  return (
    <div className="flex flex-col flex-1 min-h-0 pt-6">
      <div className="flex items-center mb-3 shrink-0">
        {isBulkEdit && (
          <input
            type="checkbox"
            checked={bulkEnabled}
            onChange={onBulkToggle}
            className="mr-2 w-4 h-4 rounded border-theme-item text-theme-accent focus:ring-theme-accent cursor-pointer"
          />
        )}
        <h4 className={`text-sm font-bold text-theme-text-secondary uppercase tracking-widest ${isBulkEdit && !bulkEnabled ? 'opacity-50' : ''}`}>Notes</h4>
      </div>
      <div className={`flex-1 flex flex-col min-h-0 bg-theme-item rounded-lg overflow-hidden border border-theme-grid-divider text-theme-text transition-opacity ${isBulkEdit && !bulkEnabled ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <ReactQuill
          theme="snow"
          value={localDetails}
          onChange={setLocalDetails}
          modules={QUILL_MODULES}
          className="quill-editor-custom flex-1 flex flex-col min-h-0"
        />
      </div>
    </div>
  );
};