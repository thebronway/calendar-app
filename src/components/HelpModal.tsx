import React from 'react';
import { X, HelpCircle, MousePointer, Layers, BookOpen } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToGuide: () => void;
  isAdmin: boolean;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onGoToGuide, isAdmin }) => {
  if (!isOpen) return null;

  // Dynamically build shortcuts based on admin status
  const shortcuts = [
    { keys: ['←', '→'], description: 'Navigate to the previous / next year or day' },
    { keys: ['Esc'], description: 'Close any open modal or viewer' },
    { keys: ['D'], description: 'Toggle Dark / Light Mode' },
    { keys: ['V'], description: 'Rotate between Year, Planner, and List views' },
    { keys: ['Y', 'P', 'L', 'M'], description: 'Jump to Year, Planner, List, or current Month view' },
    { keys: ['A'], description: 'Authenticate (Log in)' },
    
    // Add Admin-only shortcuts conditionally
    ...(isAdmin ? [
      { keys: ['B'], description: 'Toggle Bulk Edit mode' },
      { keys: ['C'], description: 'Open Access Control' },
      { keys: ['K'], description: 'Open Key configuration' },
      { keys: ['F'], description: 'Open Feeds manager' },
      { keys: ['S'], description: 'Open Settings' },
      { keys: ['H', 'U'], description: 'Open Help or jump to User Guide' },
    ] : [
      { keys: ['H'], description: 'Open Help' },
    ]),
  ];

  // Dynamically build interactions based on admin status
  const interactions = [
    {
      icon: <MousePointer size={16} className="text-blue-500" />,
      label: 'Click a day',
      description: isAdmin ? "View or edit that day's details." : "View that day's details.",
    },
    ...(isAdmin ? [{
      icon: <Layers size={16} className="text-indigo-500" />,
      label: 'Bulk Edit mode',
      description: 'Select multiple days and apply changes all at once.',
    }] : []),
  ];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[80] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 shrink-0">
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

        <div className="p-6 space-y-6 overflow-y-auto">
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

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              Keyboard Shortcuts
            </h4>
            <div className="space-y-3">
              {shortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-tight">{s.description}</span>
                  <div className="flex gap-1 shrink-0">
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

          {/* Hide the Admin Tip entirely if they are a view-only guest */}
          {isAdmin && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <span className="font-bold">Tip:</span> Categories color the day cell; activities appear as small icons.
              </p>
            </div>
          )}
        </div>
        
        {/* Only show User Guide button for Admins */}
        {isAdmin && (
          <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 rounded-b-xl">
            <button
              onClick={onGoToGuide}
              className="w-full flex justify-center items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <BookOpen size={18} />
              Read Full User Guide
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpModal;