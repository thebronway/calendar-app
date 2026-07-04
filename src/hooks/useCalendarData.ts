import { useState, useCallback, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { DEFAULT_KEY_ITEMS } from '../utils/constants';
import { generateCalendarForYear } from '../utils/helpers';
import type { AppConfig, CalendarDataset, KeyItem, WsMessage } from '../types';

interface UseCalendarDataParams {
  year: number;
  role: string;
  onConfigUpdate?: (config: AppConfig) => void;
}

interface SavePayload {
  dayData: CalendarDataset;
  keyItems: KeyItem[];
  lastUpdatedText: string;
}

interface UseCalendarDataReturn {
  calendarData: CalendarDataset | null;
  setCalendarData: Dispatch<SetStateAction<CalendarDataset | null>>;
  keyItems: KeyItem[];
  setKeyItems: Dispatch<SetStateAction<KeyItem[]>>;
  lastUpdatedText: string;
  setLastUpdatedText: Dispatch<SetStateAction<string>>;
  isSaving: boolean;
  isDataLoading: boolean;
  apiError: string | null;
  fetchData: (currentYear: number) => Promise<void>;
  saveData: (dataToSave: SavePayload) => Promise<void>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
}

export function useCalendarData({
  year,
  role,
  onConfigUpdate,
}: UseCalendarDataParams): UseCalendarDataReturn {
  const [calendarData, setCalendarData] = useState<CalendarDataset | null>(null);
  const [keyItems, setKeyItems] = useState<KeyItem[]>(DEFAULT_KEY_ITEMS);
  const [lastUpdatedText, setLastUpdatedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchData = useCallback(async (currentYear: number) => {
    setIsDataLoading(true);
    try {
      const response = await fetch(`/api/data/${currentYear}`);
      const data = await response.json();
      if (!data.dayData) {
        setCalendarData(generateCalendarForYear(currentYear));
        setKeyItems(DEFAULT_KEY_ITEMS);
        setLastUpdatedText('');
      } else {
        setCalendarData(data.dayData);
        setKeyItems(data.keyItems || DEFAULT_KEY_ITEMS);
        setLastUpdatedText(data.lastUpdatedText);
      }
    } catch {
      setApiError('Failed to load data');
      setCalendarData({});
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  const saveData = useCallback(
    async (dataToSave: SavePayload) => {
      if (role !== 'admin') return;
      setIsSaving(true);
      try {
        const res = await fetch(`/api/data/${year}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSave),
        });
        
        if (res.status === 401 || res.status === 403) {
          window.location.reload();
          return;
        }
        
        if (!res.ok) {
          alert(`Save failed! Server returned ${res.status}. Your changes were NOT saved.`);
          window.location.reload();
          return;
        }
      } catch (err) {
        alert("Network error. Save failed.");
        setApiError('Save failed');
      } finally {
        setTimeout(() => setIsSaving(false), 500);
      }
    },
    [role, year]
  );

  const connectWebSocket = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    wsRef.current = new WebSocket(`${protocol}//${window.location.host}`);

    wsRef.current.onopen = () => setApiError(null);

    wsRef.current.onmessage = (event: MessageEvent) => {
      const message: WsMessage = JSON.parse(event.data as string);
      if (message.type === 'DATA_UPDATE') {
        const { year: uYear, data: uData } = message.payload;
        setCalendarData((prev) => {
          if (uYear === year) {
            setKeyItems(uData.keyItems || DEFAULT_KEY_ITEMS);
            setLastUpdatedText(uData.lastUpdatedText);
            return uData.dayData;
          }
          return prev;
        });
      } else if (message.type === 'CONFIG_UPDATE') {
        onConfigUpdate?.(message.payload);
      } else if (message.type === 'FORCE_RELOAD') {
        window.location.reload();
      }
    };

    wsRef.current.onclose = () => {
      setTimeout(connectWebSocket, 3000);
    };
  }, [year, onConfigUpdate]);

  const disconnectWebSocket = useCallback(() => {
    wsRef.current?.close();
  }, []);

  return {
    calendarData,
    setCalendarData,
    keyItems,
    setKeyItems,
    lastUpdatedText,
    setLastUpdatedText,
    isSaving,
    isDataLoading,
    apiError,
    fetchData,
    saveData,
    connectWebSocket,
    disconnectWebSocket,
  };
}
