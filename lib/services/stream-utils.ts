/**
 * Shared utilities for stream API routes (Twitch and YouTube).
 * Includes type definitions, duration parsing, and simple in-memory caching.
 */

/**
 * Normalized stream data from both platforms.
 */
export interface PastStream {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  createdAt: string; // ISO date
  platform: 'twitch' | 'youtube';
}

/**
 * A YouTube playlist with its videos (videos use the PastStream shape so
 * StreamCard can render them unchanged).
 */
export interface YouTubePlaylist {
  id: string;
  title: string;
  thumbnailUrl: string;
  itemCount: number;
  items: PastStream[];
}

/**
 * Parse ISO 8601 duration (YouTube format) to human-readable format.
 * Example: PT3H21M5S → "3:21:05", PT45M → "45:00", PT30S → "0:30"
 */
export function formatDuration(iso8601: string): string {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Parse Twitch duration format to human-readable format.
 * Example: "3h21m10s" → "3:21:10", "45m30s" → "45:30", "30s" → "0:30"
 */
export function formatTwitchDuration(duration: string): string {
  const hourMatch = duration.match(/(\d+)h/);
  const minMatch = duration.match(/(\d+)m/);
  const secMatch = duration.match(/(\d+)s/);

  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
  const seconds = secMatch ? parseInt(secMatch[1], 10) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Simple in-memory cache with TTL.
 */
export function createCache<T>(ttlMs: number) {
  const cache = new Map<string, { value: T; expiresAt: number }>();

  return {
    get(key: string): T | null {
      const entry = cache.get(key);
      if (!entry) return null;

      if (entry.expiresAt < Date.now()) {
        cache.delete(key);
        return null;
      }

      return entry.value;
    },

    set(key: string, value: T): void {
      cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      });
    },
  };
}
