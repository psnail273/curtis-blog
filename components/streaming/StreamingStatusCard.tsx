'use client';

import { Twitch, Youtube, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreamStatus } from '@/contexts/LiveStatusContext';

interface StreamingStatusCardProps {
  platform: 'twitch' | 'youtube';
  username: string;
  streamStatus: StreamStatus | undefined;
  isLoading: boolean;
}

/**
 * Generate the URL for a stream based on platform, username, and status.
 * Replicates the logic from the header LiveIndicator for consistency.
 *
 * - Twitch: Always https://twitch.tv/{username}
 * - YouTube live with videoId: https://youtube.com/watch?v={videoId}
 * - YouTube offline/no videoId: https://youtube.com/channel/{username}
 */
function getStreamUrl(
  platform: 'twitch' | 'youtube',
  username: string,
  streamStatus?: StreamStatus
): string {
  if (!username) {
    return '';
  }

  switch (platform) {
    case 'twitch':
      return `https://twitch.tv/${username}`;
    case 'youtube':
      if (streamStatus?.isLive && streamStatus.metadata?.videoId) {
        return `https://youtube.com/watch?v=${streamStatus.metadata.videoId}`;
      }
      return `https://youtube.com/channel/${username}`;
    default:
      return '';
  }
}

/**
 * Returns the display-friendly platform name.
 */
function getPlatformLabel(platform: 'twitch' | 'youtube'): string {
  return platform === 'twitch' ? 'Twitch' : 'YouTube';
}

/**
 * Returns the appropriate Lucide icon component for the platform.
 */
function PlatformIcon({ platform, className }: { platform: 'twitch' | 'youtube'; className?: string }) {
  if (platform === 'twitch') {
    return <Twitch className={className} aria-hidden="true" />;
  }
  return <Youtube className={className} aria-hidden="true" />;
}

export default function StreamingStatusCard({
  platform,
  username,
  streamStatus,
  isLoading,
}: StreamingStatusCardProps) {
  const isLive = streamStatus?.isLive === true && !streamStatus?.error && !streamStatus?.isLoading;
  const streamUrl = getStreamUrl(platform, username, streamStatus);
  const platformLabel = getPlatformLabel(platform);

  const handleClick = () => {
    if (streamUrl) {
      window.open(streamUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // --- Loading skeleton state ---
  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-lg border border-border bg-card p-6',
          'animate-pulse'
        )}
        aria-label={`Loading ${platformLabel} status`}
        role="status"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-full bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
        <div className="h-4 w-32 rounded bg-muted" />
      </div>
    );
  }

  // --- Live state ---
  if (isLive) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'group relative cursor-pointer rounded-lg border-2 p-6',
          'border-accent bg-card',
          'shadow-warm transition-all duration-200 ease-out',
          'hover:shadow-warm-hover hover:-translate-y-1',
          'active:translate-y-0 active:shadow-warm',
          'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
          'animate-live-pulse hover:[animation-play-state:paused]'
        )}
        aria-label={`${platformLabel} is live. Click to watch now.`}
      >
        {/* Header row: icon + platform name + LIVE badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <PlatformIcon
              platform={platform}
              className="size-6 text-foreground"
            />
            <span className="font-semibold text-foreground text-lg">
              {platformLabel}
            </span>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full',
              'text-xs font-bold uppercase tracking-wider',
              'bg-accent text-accent-foreground'
            )}
          >
            <span
              className={cn(
                'size-2 rounded-full bg-accent-foreground',
                'animate-live-dot-pulse'
              )}
              aria-hidden="true"
            />
            Live
          </span>
        </div>

        {/* Call to action */}
        <div className="flex items-center gap-2 text-accent font-medium group-hover:underline">
          <span>Watch Now</span>
          <ExternalLink className="size-4" aria-hidden="true" />
        </div>
      </div>
    );
  }

  // --- Offline state ---
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group cursor-pointer rounded-lg border border-border bg-card p-6',
        'shadow-warm transition-all duration-200 ease-out',
        'hover:shadow-warm-hover hover:-translate-y-1',
        'active:translate-y-0 active:shadow-warm',
        'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2'
      )}
      aria-label={`${platformLabel} is offline. Click to follow on ${platformLabel}.`}
    >
      {/* Header row: icon + platform name + offline badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <PlatformIcon
            platform={platform}
            className="size-6 text-muted-foreground"
          />
          <span className="font-semibold text-foreground text-lg">
            {platformLabel}
          </span>
        </div>
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full',
            'text-xs font-medium',
            'bg-muted text-muted-foreground'
          )}
        >
          Offline
        </span>
      </div>

      {/* Call to action */}
      <div className="flex items-center gap-2 text-accent font-medium group-hover:underline">
        <span>{platform === 'youtube' ? 'Subscribe' : 'Follow'}</span>
        <ExternalLink className="size-4" aria-hidden="true" />
      </div>
    </div>
  );
}
