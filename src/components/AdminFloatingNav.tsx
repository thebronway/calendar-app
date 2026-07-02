import React from 'react';
import { CalendarRange, Key, Rss, Settings } from 'lucide-react';

interface AdminFloatingNavProps {
  onToggleBulkEdit: () => void;
  onOpenKeyModal: () => void;
  onOpenFeeds: () => void;
  onOpenSettings: () => void;
}

const AdminFloatingNav: React.FC<AdminFloatingNavProps> = ({
  onToggleBulkEdit,
  onOpenKeyModal,
  onOpenFeeds,
  onOpenSettings,
}) => {
  return (
    <div className="fixed bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-2 py-2 sm:p-3 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40 flex items-center gap-2 sm:gap-3 w-[90%] sm:w-auto min-w-[280px] justify-center transition-all duration-300">
      <button
        onClick={onToggleBulkEdit}
        className="flex-1 sm:flex-none h-10 sm:h-12 px-3 sm:px-5 flex items-center justify-center bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-bold text-xs sm:text-sm shadow-sm"
        title="Bulk Edit"
      >
        <CalendarRange size={18} className="sm:mr-2" />
        <span className="hidden sm:inline">Bulk Edit</span>
      </button>
      <button
        onClick={onOpenKeyModal}
        className="flex-1 sm:flex-none h-10 sm:h-12 px-3 sm:px-5 flex items-center justify-center bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-bold text-xs sm:text-sm shadow-sm"
        title="Edit Key"
      >
        <Key size={18} className="sm:mr-2" />
        <span className="hidden sm:inline">Key</span>
      </button>
      <button
        onClick={onOpenFeeds}
        className="flex-1 sm:flex-none h-10 sm:h-12 px-3 sm:px-5 flex items-center justify-center bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-bold text-xs sm:text-sm shadow-sm"
        title="Manage Feeds"
      >
        <Rss size={18} className="sm:mr-2" />
        <span className="hidden sm:inline">Feeds</span>
      </button>
      <button
        onClick={onOpenSettings}
        className="flex-1 sm:flex-none h-10 sm:h-12 px-3 sm:px-5 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-xs sm:text-sm shadow-sm"
        title="Settings"
      >
        <Settings size={18} className="sm:mr-2" />
        <span className="hidden sm:inline">Settings</span>
      </button>
    </div>
  );
};

export default AdminFloatingNav;