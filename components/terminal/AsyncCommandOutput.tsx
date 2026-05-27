'use client';

import { useState, useEffect } from 'react';

interface AsyncCommandOutputProps {
  /** Async function that returns the rendered output. */
  loadData: () => Promise<React.ReactNode>;
}

/**
 * Wrapper component for terminal commands that require async data fetching.
 * Displays "Loading..." while waiting, renders the result on success,
 * and shows an error message on failure.
 *
 * This component is returned synchronously from command handlers so the
 * existing CommandHandler return type (React.ReactNode) stays unchanged.
 */
export function AsyncCommandOutput({ loadData }: AsyncCommandOutputProps) {
  const [content, setContent] = useState<React.ReactNode>(
    <p className="text-muted">Loading...</p>
  );

  useEffect(() => {
    let cancelled = false;

    loadData()
      .then((result) => {
        if (!cancelled) setContent(result);
      })
      .catch(() => {
        if (!cancelled) {
          setContent(
            <p className="text-muted">Error loading files. Try again later.</p>
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loadData]);

  return <>{content}</>;
}
