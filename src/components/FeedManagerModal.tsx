import React, { useState, useEffect } from 'react';
import { X, Rss, Loader } from 'lucide-react';
import { FeedBuilderForm } from './FeedBuilderForm';
import { FeedList } from './FeedList';
import type { FeedProfile } from '../hooks/useFeeds';
import type { KeyItem, DayData, Role } from '../types';

interface FeedManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeds: FeedProfile[];
  isFeedsLoading: boolean;
  keyItems: KeyItem[];
  calendarData: Record<string, DayData>;
  year: number;
  onSaveFeed: (feed: FeedProfile) => Promise<boolean>;
  onDeleteFeed: (id: string) => Promise<boolean>;
  role: Role;
}

const FeedManagerModal: React.FC<FeedManagerModalProps> = ({
  isOpen,
  onClose,
  feeds,
  isFeedsLoading,
  keyItems,
  calendarData,
  year,
  onSaveFeed,
  onDeleteFeed,
  role,
}) => {
  const [view, setView] = useState<'list' | 'builder'>('list');
  const [editingFeed, setEditingFeed] = useState<FeedProfile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset to list view when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setView('list');
        setEditingFeed(null);
        setCopiedId(null);
      }, 300); // Wait for exit animation
    }
  }, [isOpen]);

  const handleCreateNew = () => {
    setEditingFeed(null);
    setView('builder');
  };

  const handleEdit = (feed: FeedProfile) => {
    setEditingFeed(feed);
    setView('builder');
  };

  const handleCopyUrl = (token?: string, id?: string) => {
    if (!token || !id) return;
    const url = `${window.location.origin}/api/feed/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = async (feed: FeedProfile) => {
    setIsSaving(true);
    const success = await onSaveFeed(feed);
    setIsSaving(false);
    if (success) {
      setView('list');
      setEditingFeed(null);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this feed? Anyone subscribed to it will stop receiving updates.')) {
      await onDeleteFeed(id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <Rss size={24} className="mr-3 text-orange-500" />
            {view === 'list' ? 'iCal Subscriptions' : editingFeed ? 'Edit Feed' : 'Create New Feed'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'list' ? (
            <FeedList
              feeds={feeds}
              isFeedsLoading={isFeedsLoading}
              role={role}
              keyItems={keyItems}
              copiedId={copiedId}
              onCreateNew={handleCreateNew}
              onCopyUrl={handleCopyUrl}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <div className="relative">
              {isSaving && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 z-10 flex items-center justify-center rounded-xl">
                  <Loader size={32} className="animate-spin text-blue-600" />
                </div>
              )}
              <FeedBuilderForm
                initialData={editingFeed}
                onSave={handleSave}
                onCancel={() => {
                  setView('list');
                  setEditingFeed(null);
                }}
                currentYear={year || new Date().getFullYear()}
                availableCategories={keyItems.filter(k => k.isColorKey).map(k => ({ id: k.id, label: k.label }))}
                availableActivities={keyItems.filter(k => !k.isColorKey).map(k => ({ icon: k.icon || '', value: k.id, label: k.label, color: k.iconColor || '' }))}
                availableLocations={Array.from(new Set(Object.values(calendarData).map(d => d.locations).filter(Boolean).flatMap(l => l.split(',').map(s => s.trim()))))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedManagerModal;