import React, { useState, useEffect } from 'react';
import { X, Rss, Plus, Copy, Edit2, Trash2, CheckCircle2, Link as LinkIcon, Loader } from 'lucide-react';
import { FeedBuilderForm } from './FeedBuilderForm';
import type { FeedProfile } from '../hooks/useFeeds';
import type { KeyItem, DayData } from '../types';

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
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create custom calendar feeds to sync your trips with Apple Calendar, Google Calendar, or Outlook.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-blue-700 transition-colors flex-shrink-0 ml-4"
                >
                  <Plus size={18} className="mr-2" /> New Feed
                </button>
              </div>

              {isFeedsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader size={32} className="animate-spin text-gray-400" />
                </div>
              ) : feeds.length > 0 ? (
                <div className="space-y-4">
                  {feeds.map((feed) => (
                    <div
                      key={feed.id}
                      className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
                          {feed.name}
                        </h4>
                        <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md capitalize">
                            Trigger: {feed.triggerType}
                          </span>
                          {feed.triggerType === 'data' && (
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md capitalize">
                              Mode: {feed.dataTriggerMode}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-md capitalize ${feed.isPublic ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                            {feed.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 dark:border-gray-700 flex-wrap">
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => handleCopyUrl(feed.token, `${feed.id}-private`)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                              copiedId === `${feed.id}-private`
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            {copiedId === `${feed.id}-private` ? <><CheckCircle2 size={14} /> Copied</> : <><LinkIcon size={14} /> Private URL</>}
                          </button>
                          
                          {feed.isPublic && feed.publicToken && (
                            <button
                              onClick={() => handleCopyUrl(feed.publicToken, `${feed.id}-public`)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                copiedId === `${feed.id}-public`
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 border border-orange-200 dark:border-orange-800'
                              }`}
                            >
                              {copiedId === `${feed.id}-public` ? <><CheckCircle2 size={14} /> Copied</> : <><LinkIcon size={14} /> Public URL</>}
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleEdit(feed)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors border dark:border-gray-700"
                          title="Edit Feed"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(feed.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors border dark:border-gray-700"
                          title="Delete Feed"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <Rss size={48} className="mx-auto text-gray-400 mb-4 opacity-50" />
                  <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                    No feeds created yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                    Create a feed to generate a unique URL you can subscribe to in your favorite calendar app.
                  </p>
                  <button
                    onClick={handleCreateNew}
                    className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Create First Feed
                  </button>
                </div>
              )}
            </div>
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