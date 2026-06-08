import React from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Link as LinkIcon, Loader, Rss } from 'lucide-react';
import type { FeedProfile } from '../hooks/useFeeds';
import type { KeyItem, Role } from '../types';

interface FeedListProps {
  feeds: FeedProfile[];
  isFeedsLoading: boolean;
  role: Role;
  keyItems: KeyItem[];
  copiedId: string | null;
  onCreateNew: () => void;
  onCopyUrl: (token?: string, id?: string) => void;
  onEdit: (feed: FeedProfile) => void;
  onDelete: (id?: string) => void;
}

export const FeedList: React.FC<FeedListProps> = ({
  feeds,
  isFeedsLoading,
  role,
  keyItems,
  copiedId,
  onCreateNew,
  onCopyUrl,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create custom calendar feeds to sync your trips with Apple Calendar, Google Calendar, or Outlook.
        </p>
        {role === 'admin' && (
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-blue-700 transition-colors flex-shrink-0 ml-4"
          >
            <Plus size={18} className="mr-2" /> New Feed
          </button>
        )}
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
                <div className="flex flex-wrap gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 mt-1.5">
                  {(() => {
                    const tags: string[] = [];
                    
                    if (role === 'admin') {
                      let eventType = 'Categories & Activities';
                      if (feed.triggerType === 'location') {
                        eventType = 'Location';
                      } else if (feed.dataTriggerMode === 'categories') {
                        eventType = 'Categories';
                      } else if (feed.dataTriggerMode === 'activities') {
                        eventType = 'Activities';
                      }
                      tags.push(`Events: ${eventType}`);
                      tags.push(feed.isPublic ? 'Public' : 'Private');
                    } else {
                      if (feed.triggerType === 'location') {
                        if (feed.locationMode === 'specific' && feed.selectedLocations?.length) {
                          tags.push(...feed.selectedLocations);
                        } else {
                          tags.push('Any Location');
                        }
                      } else {
                        if (feed.dataTriggerMode !== 'activities' && feed.selectedCategories?.length) {
                          tags.push(...feed.selectedCategories.map(id => keyItems.find(k => k.id === id)?.label || id));
                        }
                        if (feed.dataTriggerMode !== 'categories' && feed.selectedActivities?.length) {
                          tags.push(...feed.selectedActivities.map(val => {
                            const kItem = keyItems.find(k => k.id === val || k.icon === val);
                            return kItem ? kItem.label : val;
                          }));
                        }
                      }
                      if (tags.length === 0) tags.push('All Events');
                    }

                    return tags.map((tag, i) => (
                      <span key={i} className="bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 px-2 py-1 rounded-md shadow-sm">
                        {tag}
                      </span>
                    ));
                  })()}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 dark:border-gray-700 flex-wrap">
                {role === 'admin' ? (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => onCopyUrl(feed.token, `${feed.id}-private`)}
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
                          onClick={() => onCopyUrl(feed.publicToken, `${feed.id}-public`)}
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
                      onClick={() => onEdit(feed)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors border dark:border-gray-700"
                      title="Edit Feed"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(feed.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors border dark:border-gray-700"
                      title="Delete Feed"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onCopyUrl(feed.publicToken, `${feed.id}-public`)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                      copiedId === `${feed.id}-public`
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-orange-500 text-white hover:bg-orange-600 border border-orange-600'
                    }`}
                  >
                    {copiedId === `${feed.id}-public` ? <><CheckCircle2 size={16} /> Copied</> : <><LinkIcon size={16} /> Copy Subscription URL</>}
                  </button>
                )}
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
            {role === 'admin' 
              ? 'Create a feed to generate a unique URL you can subscribe to in your favorite calendar app.' 
              : 'No public feeds are currently available.'}
          </p>
          {role === 'admin' && (
            <button
              onClick={onCreateNew}
              className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Create First Feed
            </button>
          )}
        </div>
      )}
    </div>
  );
};