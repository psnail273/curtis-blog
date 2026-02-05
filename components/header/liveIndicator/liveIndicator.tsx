'use client';

import { Twitch, Youtube } from 'lucide-react';
import styles from './liveIndicator.module.scss';
import { LiveStatusState, StreamConfig } from '@/contexts/LiveStatusContext';

interface LiveIndicatorProps {
  status: LiveStatusState;
  streams: StreamConfig[];
}

/**
 * Generate the URL for a stream based on platform, username, and status
 * For YouTube: If live and videoId is available, link to the video. Otherwise, link to the channel.
 * For Twitch: Always link to the channel page.
 */
function getStreamUrl(
  platform: 'twitch' | 'youtube',
  username: string,
  streamStatus?: { isLive: boolean; metadata?: { videoId?: string } }
): string {
  if (!username) {
    return '';
  }

  switch (platform) {
    case 'twitch':
      return `https://twitch.tv/${username}`;
    case 'youtube':
      // If live and we have a videoId, link directly to the video
      if (streamStatus?.isLive && streamStatus.metadata?.videoId) {
        return `https://youtube.com/watch?v=${streamStatus.metadata.videoId}`;
      }
      // Otherwise link to the channel page (username is actually a channel ID)
      return `https://youtube.com/channel/${username}`;
    default:
      return '';
  }
}

export default function LiveIndicator({ status, streams }: LiveIndicatorProps) {
  if (streams.length === 0) {
    return null;
  }

  const handleStreamClick = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={styles.liveIndicator}>
      <div className={styles.platforms}>
        {streams.map(stream => {
          const key = `${stream.platform}:${stream.username}`;
          const streamStatus = status[key];
          const isOffline = !streamStatus?.isLive || streamStatus?.error !== null || streamStatus?.isLoading;
          const streamUrl = getStreamUrl(stream.platform, stream.username, streamStatus);
          const platformLabel = stream.platform === 'twitch' ? 'Twitch' : 'YouTube';

          return (
            <button
              key={key}
              className={`${styles.platformButton} ${isOffline ? styles.offline : ''}`}
              onClick={() => handleStreamClick(streamUrl)}
              aria-label={`Open ${platformLabel} stream for ${stream.username}`}
              title={`${platformLabel}: ${stream.username}`}
              disabled={!streamUrl}
            >
              {stream.platform === 'twitch' ? (
                <Twitch size={16} aria-hidden="true" />
              ) : (
                <Youtube size={16} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
