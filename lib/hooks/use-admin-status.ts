'use client';

import { useState, useEffect } from 'react';

// Module-level cache to avoid repeated API calls across navigations
let cachedStatus: boolean | null = null;
let listeners: Set<(status: boolean) => void> = new Set();

export function invalidateAdminStatus(newStatus?: boolean) {
  if (newStatus !== undefined) {
    cachedStatus = newStatus;
    listeners.forEach((fn) => fn(newStatus));
  } else {
    cachedStatus = null;
  }
}

export function useAdminStatus(): { isAdmin: boolean; loading: boolean } {
  const [isAdmin, setIsAdmin] = useState(cachedStatus ?? false);
  const [loading, setLoading] = useState(cachedStatus === null);

  useEffect(() => {
    const listener = (status: boolean) => {
      setIsAdmin(status);
      setLoading(false);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (cachedStatus !== null) return;

    let cancelled = false;

    async function checkAdmin() {
      try {
        const res = await fetch('/api/admin/auth');
        if (!res.ok) {
          cachedStatus = false;
          if (!cancelled) {
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }
        const data = await res.json();
        cachedStatus = data.authenticated === true;
        if (!cancelled) {
          setIsAdmin(cachedStatus);
          setLoading(false);
        }
      } catch {
        cachedStatus = false;
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    }

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isAdmin, loading };
}
