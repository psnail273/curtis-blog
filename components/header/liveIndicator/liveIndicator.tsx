'use client';

import { Twitch, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreamConfig, LiveStatusState, StreamStatus } from '@/contexts/LiveStatusContext';

interface LiveIndicatorProps {
  streams: StreamConfig[];
  status: LiveStatusState;
  isLoading: boolean;
}

function getStreamUrl(
  platform: 'twitch' | 'youtube',
  username: string,
  streamStatus?: StreamStatus
): string {
  if (!username) return '';

  switch (platform) {
    case 'twitch':
      return `https://twitch.tv/${username}`;
    case 'youtube': {
      if (streamStatus?.isLive && streamStatus.metadata?.videoId) {
        return `https://youtube.com/watch?v=${streamStatus.metadata.videoId}`;
      }
      const handle = process.env.NEXT_PUBLIC_YOUTUBE_HANDLE;
      if (handle) return `https://youtube.com/@${handle}`;
      return `https://youtube.com/channel/${username}`;
    }
    default:
      return '';
  }
}

function getPlatformLabel(platform: 'twitch' | 'youtube'): string {
  return platform === 'twitch' ? 'Twitch' : 'YouTube';
}

function PlatformIcon({ platform, className }: { platform: 'twitch' | 'youtube'; className?: string }) {
  if (platform === 'twitch') {
    return <Twitch className={className} aria-hidden="true" />;
  }
  return <Youtube className={className} aria-hidden="true" />;
}

export default function LiveIndicator({ streams, status }: LiveIndicatorProps) {
  if (streams.length === 0) return null;

  const isAnyLive = streams.some((stream) => {
    const key = `${stream.platform}:${stream.username}`;
    const s = status[key];
    return s?.isLive && !s?.error;
  });

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border px-3 py-1.5',
        'transition-colors duration-200',
        isAnyLive
          ? 'border-accent/40 bg-accent/5'
          : 'border-border bg-transparent'
      )}
      role="region"
      aria-label="Stream status"
    >
      {/* Indicator dot */}
      <span
        className={cn(
          'size-2 shrink-0 rounded-full transition-colors duration-200',
          isAnyLive
            ? 'bg-accent animate-live-dot-pulse motion-reduce:animate-none'
            : 'bg-muted-foreground/40'
        )}
        aria-hidden="true"
      />

      {/* LIVE label */}
      <span
        className={cn(
          'text-xs font-semibold uppercase tracking-wider select-none transition-colors duration-200',
          isAnyLive ? 'text-accent' : 'text-muted-foreground'
        )}
      >
        Live
      </span>

      {/* Divider */}
      <div
        className={cn(
          'w-px h-4 transition-colors duration-200',
          isAnyLive ? 'bg-accent/30' : 'bg-border'
        )}
        aria-hidden="true"
      />

      {/* Stream icons */}
      {streams.map((stream) => {
        const key = `${stream.platform}:${stream.username}`;
        const streamStatus = status[key];
        const isLive = streamStatus?.isLive && !streamStatus?.error;
        const streamUrl = getStreamUrl(stream.platform, stream.username, streamStatus);
        const platformLabel = getPlatformLabel(stream.platform);

        return (
          <a
            key={key}
            href={streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${platformLabel} — ${isLive ? 'Live now' : 'Offline'}`}
            className={cn(
              'inline-flex items-center justify-center p-1 rounded-md',
              'transition-colors duration-200',
              'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
              isLive
                ? 'text-accent hover:text-accent/80'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <PlatformIcon platform={stream.platform} className="size-4 md:size-5" />
          </a>
        );
      })}

      {/* Screen reader live status announcement */}
      <span role="status" aria-live="polite" className="sr-only">
        {streams.map((stream) => {
          const key = `${stream.platform}:${stream.username}`;
          const streamStatus = status[key];
          const isLive = streamStatus?.isLive && !streamStatus?.error;
          const platformLabel = getPlatformLabel(stream.platform);
          return isLive ? `${platformLabel} stream is now live. ` : '';
        }).join('')}
      </span>
    </div>
  );
}
