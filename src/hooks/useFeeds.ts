import { useState, useCallback } from 'react';

export interface FeedProfile {
  id?: string;
  token?: string;
  publicToken?: string;
  isPublic?: boolean;
  name: string;
  // Step 1: The Trigger & Title Configuration
  triggerType: 'data' | 'location';
  dataTriggerMode?: 'categories' | 'activities' | 'both';
  dataLogicalOperator?: 'AND' | 'OR';
  selectedCategories?: string[];
  selectedActivities?: string[];
  locationMode?: 'any' | 'specific';
  selectedLocations?: string[]; // stored as string array if specific

  // Step 2: The Payload (Sub-categories / Metadata)
  includeLocationField: boolean;
  descriptionPayload: string[];
}

interface UseFeedsParams {
  role: string;
}

export function useFeeds({ role }: UseFeedsParams) {
  const [feeds, setFeeds] = useState<FeedProfile[]>([]);
  const [isFeedsLoading, setIsFeedsLoading] = useState(false);

  const fetchFeeds = useCallback(async () => {
    setIsFeedsLoading(true);
    try {
      if (role === 'admin') {
        const response = await fetch('/api/feeds');
        if (response.status === 401 || response.status === 403) {
          window.location.reload();
          return;
        }
        if (response.ok) {
          const data = await response.json();
          setFeeds(data);
        }
      } else {
        const response = await fetch('/api/feeds/public');
        if (response.ok) {
          const data = await response.json();
          setFeeds(data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch feeds', e);
    } finally {
      setIsFeedsLoading(false);
    }
  }, [role]);

  const saveFeed = useCallback(async (feed: FeedProfile) => {
    if (role !== 'admin') return false;
    try {
      const response = await fetch('/api/feeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feed),
      });
      if (response.status === 401 || response.status === 403) {
        window.location.reload();
        return false;
      }
      if (response.ok) {
        await fetchFeeds();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to save feed', e);
      return false;
    }
  }, [role, fetchFeeds]);

  const deleteFeed = useCallback(async (id: string) => {
    if (role !== 'admin') return false;
    try {
      const response = await fetch(`/api/feeds/${id}`, {
        method: 'DELETE',
      });
      if (response.status === 401 || response.status === 403) {
        alert("Session expired. Please log in again.");
        window.location.reload();
        return false;
      }
      if (response.ok) {
        setFeeds((prev) => prev.filter((f) => f.id !== id));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to delete feed', e);
      return false;
    }
  }, [role]);

  return { feeds, isFeedsLoading, fetchFeeds, saveFeed, deleteFeed };
}