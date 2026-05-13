import React from 'react';
import { X, HelpCircle, ChevronLeft, ChevronRight, MousePointer, Layers } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      keys: ['←', '→'],
      icon: <ChevronLeft size={16} className="inline" />,
      description: 'Navigate to the previous / next year',
    },
    {
      keys: ['Esc'],
      description: 'Close any open modal or editor',
    },
  ];

  const interactions = [
    {
      icon: <MousePointer size={16} className="text-blue-500" />,
      label: 'Click a day',
      description: 'View or edit that day\'s details',
    },
    {
      icon: <Layers size={16} className="text-indigo-500" />,
      label: 'Bulk Edit mode',
      description: 'Select multiple days and apply changes all at once',
    },
  ];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[80] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <HelpCircle size={22} className="mr-2 text-blue-500" /> Help & Shortcuts
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              Keyboard Shortcuts
            </h4>
            <div className="space-y-3">
              {shortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{s.description}</span>
                  <div className="flex gap-1 ml-4 shrink-0">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              How It Works
            </h4>
            <div className="space-y-3">
              {interactions.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{item.icon}</div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.label}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-bold">Admin tip:</span> Log in to unlock editing. Categories color the day cell; activities appear as small icons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
