import React from 'react';
import ReactQuill from 'react-quill';
import { QUILL_MODULES } from '../../utils/constants';

interface EditorNotesProps {
  localDetails: string;
  setLocalDetails: (val: string) => void;
}

export const EditorNotes: React.FC<EditorNotesProps> = ({ localDetails, setLocalDetails }) => {
  return (
    <div className="flex flex-col flex-1 min-h-0 pt-6">
      <h4 className="text-sm font-bold text-theme-text-secondary uppercase tracking-widest mb-3 shrink-0">Notes</h4>
      <div className="flex-1 flex flex-col min-h-0 bg-theme-item rounded-lg overflow-hidden border border-theme-grid-divider text-theme-text">
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