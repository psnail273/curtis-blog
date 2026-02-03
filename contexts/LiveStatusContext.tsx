'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LiveStatusContextValue {
  isLive: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const LiveStatusContext = createContext<LiveStatusContextValue | undefined>(undefined);

const POLL_INTERVAL = 90 * 1000; // 90 seconds

interface LiveStatusProviderProps {
  children: ReactNode;
}

export function LiveStatusProvider({ children }: LiveStatusProviderProps) {
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveStatus = async () => {
    try {
      setError(null);
      const response = await fetch('/api/live-status');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setIsLive(data.isLive || false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.warn('Failed to fetch live status:', errorMessage);
      setError(errorMessage);
      setIsLive(false); // Fail safely to offline
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLiveStatus();

    // Set up polling interval
    const intervalId = setInterval(fetchLiveStatus, POLL_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  const value: LiveStatusContextValue = {
    isLive,
    isLoading,
    error,
    refetch: fetchLiveStatus,
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
