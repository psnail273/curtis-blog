import { NextRequest, NextResponse } from 'next/server';
import { type PastStream, formatDuration, createCache } from '@/lib/services/stream-utils';

interface YouTubeSearchItem {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
        width: number;
        height: number;
      };
    };
  };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
  nextPageToken?: string;
}

interface YouTubeVideoItem {
  id: string;
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
  };
}

interface YouTubeVideosResponse {
  items: YouTubeVideoItem[];
}

interface YouTubeStreamsResponse {
  streams: PastStream[];
  pageToken: string | null;
}

// 5-minute cache for past streams
const streamsCache = createCache<YouTubeStreamsResponse>(5 * 60 * 1000);

/**
 * GET /api/streams/youtube?pageToken={token}
 *
 * Fetches past live streams from YouTube Data API v3.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageToken = searchParams.get('pageToken') || '';

    // Check for required env vars
    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json(
        {
          streams: [],
          pageToken: null,
          error: 'YouTube is not configured. Missing API key.',
        },
        { status: 200 }
      );
    }

    const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;
    if (!channelId) {
      return NextResponse.json(
        {
          streams: [],
          pageToken: null,
          error: 'YouTube channel ID not configured.',
        },
        { status: 200 }
      );
    }

    // Check cache
    const cacheKey = `youtube:${channelId}:${pageToken}`;
    const cached = streamsCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // Step 1: Search for completed live streams
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('channelId', channelId);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('eventType', 'completed');
    searchUrl.searchParams.set('order', 'date');
    searchUrl.searchParams.set('maxResults', '12');
    searchUrl.searchParams.set('key', process.env.YOUTUBE_API_KEY);
    if (pageToken) {
      searchUrl.searchParams.set('pageToken', pageToken);
    }

    const searchResponse = await fetch(searchUrl.toString());

    if (!searchResponse.ok) {
      throw new Error(`YouTube search API error: ${searchResponse.status}`);
    }

    const searchData: YouTubeSearchResponse = await searchResponse.json();

    if (searchData.items.length === 0) {
      return NextResponse.json(
        {
          streams: [],
          pageToken: null,
        },
        {
          headers: {
            'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    }

    // Step 2: Get video details (duration + view count)
    const videoIds = searchData.items.map(item => item.id.videoId).join(',');
    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videosUrl.searchParams.set('part', 'contentDetails,statistics');
    videosUrl.searchParams.set('id', videoIds);
    videosUrl.searchParams.set('key', process.env.YOUTUBE_API_KEY);

    const videosResponse = await fetch(videosUrl.toString());

    if (!videosResponse.ok) {
      throw new Error(`YouTube videos API error: ${videosResponse.status}`);
    }

    const videosData: YouTubeVideosResponse = await videosResponse.json();

    // Create a map of video details by ID
    const videoDetailsMap = new Map(
      videosData.items.map(item => [item.id, item])
    );

    // Transform to normalized format
    const streams = searchData.items
      .map((item) => {
        const videoId = item.id.videoId;
        const details = videoDetailsMap.get(videoId);

        if (!details) return null;

        return {
          id: videoId,
          title: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnailUrl: item.snippet.thumbnails.high.url,
          duration: formatDuration(details.contentDetails.duration),
          viewCount: parseInt(details.statistics.viewCount, 10),
          createdAt: item.snippet.publishedAt,
          platform: 'youtube' as const,
        };
      })
      .filter((stream) => stream !== null);

    const result: YouTubeStreamsResponse = {
      streams,
      pageToken: searchData.nextPageToken || null,
    };

    // Cache the result
    streamsCache.set(cacheKey, result);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching YouTube streams:', error);
    return NextResponse.json(
      {
        streams: [],
        pageToken: null,
        error: 'Failed to fetch YouTube streams.',
      },
      { status: 200 }
    );
  }
}
