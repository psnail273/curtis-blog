'use client';

import { useLiveStatus } from '@/contexts/LiveStatusContext';
import StreamingStatusCard from './StreamingStatusCard';
import { cn } from '@/lib/utils';

export default function StreamingStatus() {
  const { status, streams, isAnyLive, isLoading } = useLiveStatus();

  // If no streams are configured, render nothing
  if (streams.length === 0) {
    return null;
  }

  return (
    <section id="streaming-status" aria-label="Streaming status" className="animate-fade-in-up">
      {/* Section heading */}
      <h2 className="mb-6">
        {isLoading
          ? 'Checking streams...'
          : isAnyLive
            ? 'Currently Streaming'
            : 'Watch & Follow'}
      </h2>

      {/* Platform cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {streams.map((stream, index) => {
          const key = `${stream.platform}:${stream.username}`;
          const streamStatus = status[key];

          return (
            <div
              key={key}
              className={cn(
                'animate-fade-in-up',
                index === 0 && 'animation-delay-100',
                index === 1 && 'animation-delay-200',
                index >= 2 && 'animation-delay-300'
              )}
            >
              <StreamingStatusCard
                platform={stream.platform}
                username={stream.username}
                streamStatus={streamStatus}
                isLoading={isLoading}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
