import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  confirm: (options?: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within a ConfirmProvider');
  return context;
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>();

  const confirm = useCallback((opts?: ConfirmOptions) => {
    setOptions(opts || {});
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} />
                {options.title || 'Unsaved Changes'}
              </h3>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                {options.message || 'You have unsaved changes. Are you sure you want to leave without saving?'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-end gap-3">
              <button onClick={handleCancel} className="px-4 py-2 rounded-lg font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-sm">
                {options.cancelText || 'Keep Editing'}
              </button>
              <button onClick={handleConfirm} className="px-4 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm text-sm">
                {options.confirmText || 'Discard Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};