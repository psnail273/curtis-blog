'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface StreamConfig {
  platform: 'twitch' | 'youtube';
  username: string;
}

export interface StreamStatus {
  isLive: boolean;
  isLoading: boolean;
  error: string | null;
  platform: string;
  username: string;
  metadata?: {
    videoId?: string;
    [key: string]: unknown;
  };
}

export interface LiveStatusState {
  [key: string]: StreamStatus;
}

interface LiveStatusContextValue {
  status: LiveStatusState;
  streams: StreamConfig[];
  isAnyLive: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const LiveStatusContext = createContext<LiveStatusContextValue | undefined>(undefined);

const POLL_INTERVAL = 60 * 1000; // 60 seconds

interface LiveStatusProviderProps {
  streams: StreamConfig[];
  children: ReactNode;
}

export function LiveStatusProvider({ streams, children }: LiveStatusProviderProps) {
  const [status, setStatus] = useState<LiveStatusState>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchStreamStatus = useCallback(async (stream: StreamConfig) => {
    const key = `${stream.platform}:${stream.username}`;

    try {
      const response = await fetch(
        `/api/live-status/${stream.platform}/${stream.username}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setStatus(prev => ({
        ...prev,
        [key]: {
          isLive: data.isLive || false,
          isLoading: false,
          error: data.error || null,
          platform: stream.platform,
          username: stream.username,
          metadata: data.metadata,
        },
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Failed to fetch live status for ${key}:`, errorMessage);

      setStatus(prev => ({
        ...prev,
        [key]: {
          isLive: false,
          isLoading: false,
          error: errorMessage,
          platform: stream.platform,
          username: stream.username,
        },
      }));
    }
  }, []);

  const fetchAllStreams = useCallback(async () => {
    // Fetch all streams in parallel
    await Promise.all(streams.map(fetchStreamStatus));
    setIsLoading(false);
  }, [streams, fetchStreamStatus]);

  useEffect(() => {
    if (streams.length === 0) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    fetchAllStreams();

    // Set up polling interval
    const intervalId = setInterval(fetchAllStreams, POLL_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [streams, fetchAllStreams]);

  const isAnyLive = Object.values(status).some(s => s.isLive);

  const value: LiveStatusContextValue = {
    status,
    streams,
    isAnyLive,
    isLoading,
    refetch: fetchAllStreams,
  };

  return (
    <LiveStatusContext.Provider value={value}>
      {children}
    </LiveStatusContext.Provider>
  );
}

export function useLiveStatus(): LiveStatusContextValue {
  const context = useContext(LiveStatusContext);

  if (context === undefined) {
    throw new Error('useLiveStatus must be used within a LiveStatusProvider');
  }

  return context;
}
