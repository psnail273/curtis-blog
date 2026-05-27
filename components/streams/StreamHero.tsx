'use client';

import { ArrowRight } from 'lucide-react';
import { useLiveStatus, type StreamConfig } from '@/contexts/LiveStatusContext';
import { cn } from '@/lib/utils';
import type { StreamStatus } from '@/contexts/LiveStatusContext';

function getPlatformUrl(stream: StreamConfig, isLive: boolean) {
  if (stream.platform === 'twitch') {
    return `https://twitch.tv/${stream.username}`;
  }
  return isLive
    ? `https://youtube.com/channel/${stream.username}/live`
    : `https://youtube.com/channel/${stream.username}`;
}

function getPlatformName(platform: string) {
  return platform === 'twitch' ? 'Twitch' : 'YouTube';
}

function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  if (platform === 'twitch') {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}


function LiveStreamCard({ stream, streamStatus }: { stream: StreamConfig; streamStatus?: StreamStatus }) {
  const platformName = getPlatformName(stream.platform);
  const url = getPlatformUrl(stream, true);

  return (
    <div
      className={cn(
        'py-8 md:py-10 px-6 md:px-10 text-center',
        'border-2 border-live rounded-lg',
        'bg-live/10',
        'animate-live-pulse'
      )}
    >
      {/* Live badge */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-live animate-live-dot-pulse" aria-hidden="true" />
        <span className="text-live text-sm font-bold uppercase tracking-wide">
          Live
        </span>
      </div>

      {/* Platform icon + title */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <PlatformIcon platform={stream.platform} className="w-6 h-6 mb-3.5 text-foreground" />
        <h2 className="font-serif text-xl md:text-2xl font-bold text-foreground ">
          Streaming on {platformName}
        </h2>
      </div>

      {/* Stream title if available */}
      {typeof streamStatus?.metadata?.title === 'string' && streamStatus.metadata.title && (
        <p className="text-lg text-muted mb-4">
          {streamStatus.metadata.title}
        </p>
      )}

      {/* CTA button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent-hover transition-colors"
      >
        Watch on {platformName}
        <ArrowRight size={20} aria-hidden="true" />
      </a>
    </div>
  );
}

function OfflineStreamCard({ stream }: { stream: StreamConfig }) {
  const platformName = getPlatformName(stream.platform);
  const url = getPlatformUrl(stream, false);
  const label = stream.platform === 'twitch' ? 'Follow on Twitch' : 'Subscribe on YouTube';

  return (
    <div className="py-6 md:py-8 px-6 md:px-8 text-center border border-border rounded-lg bg-muted/20">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-muted hover:text-accent hover:border-accent transition-colors"
      >
        <div className="flex items-center justify-center gap-2">
          <PlatformIcon platform={stream.platform} className="w-5 h-5 text-muted" />
          <span className="text-muted text-sm font-medium uppercase tracking-wide">
            {platformName} &mdash; Offline
          </span>
        </div>
      </a>
    </div>
  );
}

export function StreamHero() {
  const { status, streams, isLoading } = useLiveStatus();

  // No streams configured
  if (streams.length === 0) return null;

  // Loading state — only shown when streams are configured (avoids
  // hydration mismatch when server renders null but client renders skeletons)
  if (isLoading) {
    return (
      <section className="mb-8 md:mb-12">
        <div className={cn(
          'grid gap-4',
          streams.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        )}>
          {streams.map((stream) => (
            <div key={`${stream.platform}:${stream.username}`} className="py-6 md:py-8 px-6 md:px-8 border border-border rounded-lg bg-muted/20 animate-pulse">
              <div className="h-6 bg-muted/40 rounded w-32 mx-auto mb-4" />
              <div className="h-4 bg-muted/40 rounded w-48 mx-auto" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className="mb-8 md:mb-12"
      role="region"
      aria-label="Live stream status"
    >
      <div className={cn(
        'grid gap-4',
        streams.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
      )}>
        {streams.map((stream) => {
          const key = `${stream.platform}:${stream.username}`;
          const streamStatus = status[key];
          const isLive = streamStatus?.isLive;

          return isLive ? (
            <LiveStreamCard key={key} stream={stream} streamStatus={streamStatus} />
          ) : (
            <OfflineStreamCard key={key} stream={stream} />
          );
        })}
      </div>
    </section>
  );
}
