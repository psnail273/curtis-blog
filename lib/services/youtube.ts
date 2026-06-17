import { type PastStream, formatDuration } from './stream-utils';

interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string };
    snippet: {
      publishedAt: string;
      liveBroadcastContent: 'live' | 'none' | 'upcoming';
      channelId: string;
      channelTitle: string;
      title: string;
      thumbnails: {
        high: { url: string };
      };
    };
  }>;
  nextPageToken?: string;
}

interface YouTubeVideosResponse {
  items: Array<{
    id: string;
    contentDetails: { duration: string };
    statistics: { viewCount: string };
  }>;
}

interface YouTubeThumbnails {
  default?: { url: string };
  medium?: { url: string };
  high?: { url: string };
}

interface YouTubePlaylistsResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      thumbnails: YouTubeThumbnails;
    };
    contentDetails: { itemCount: number };
  }>;
  nextPageToken?: string;
}

interface YouTubePlaylistItemsResponse {
  items: Array<{
    snippet: {
      title: string;
      thumbnails: YouTubeThumbnails;
    };
    contentDetails: {
      videoId: string;
      videoPublishedAt?: string;
    };
  }>;
  nextPageToken?: string;
}

export interface YouTubePlaylistMeta {
  id: string;
  title: string;
  thumbnailUrl: string;
  itemCount: number;
  position: number;
}

function pickThumbnail(thumbnails: YouTubeThumbnails): string {
  return thumbnails.high?.url ?? thumbnails.medium?.url ?? thumbnails.default?.url ?? '';
}

export interface YouTubeStreamStatus {
  isLive: boolean;
  videoId?: string;
}

export async function checkStreamStatus(channelId: string): Promise<YouTubeStreamStatus> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY not configured');
    }

    const response = await fetch(
      'https://www.googleapis.com/youtube/v3/search?' +
      `part=snippet&channelId=${encodeURIComponent(channelId)}&eventType=live&type=video` +
      `&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data: YouTubeSearchResponse = await response.json();

    // Find the first live broadcast
    const liveVideo = data.items.find(
      item => item.snippet.liveBroadcastContent === 'live'
    );

    return {
      isLive: !!liveVideo,
      videoId: liveVideo?.id.videoId,
    };
  } catch (error) {
    console.error('Error checking YouTube stream status:', error);
    return { isLive: false };
  }
}

export async function fetchPastStreams(channelId: string): Promise<PastStream[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  // Step 1: Search for completed live streams
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('channelId', channelId);
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('eventType', 'completed');
  searchUrl.searchParams.set('order', 'date');
  searchUrl.searchParams.set('maxResults', '50');
  searchUrl.searchParams.set('key', apiKey);

  const searchResponse = await fetch(searchUrl.toString());
  if (!searchResponse.ok) {
    throw new Error(`YouTube search API error: ${searchResponse.status}`);
  }

  const searchData: YouTubeSearchResponse = await searchResponse.json();
  if (searchData.items.length === 0) return [];

  // Step 2: Get video details (duration + view count)
  const videoIds = searchData.items.map(item => item.id.videoId).join(',');
  const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  videosUrl.searchParams.set('part', 'contentDetails,statistics');
  videosUrl.searchParams.set('id', videoIds);
  videosUrl.searchParams.set('key', apiKey);

  const videosResponse = await fetch(videosUrl.toString());
  if (!videosResponse.ok) {
    throw new Error(`YouTube videos API error: ${videosResponse.status}`);
  }

  const videosData: YouTubeVideosResponse = await videosResponse.json();
  const detailsMap = new Map(videosData.items.map(item => [item.id, item]));

  const streams: PastStream[] = [];
  for (const item of searchData.items) {
    const details = detailsMap.get(item.id.videoId);
    if (!details) continue;
    streams.push({
      id: item.id.videoId,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnailUrl: item.snippet.thumbnails.high.url,
      duration: formatDuration(details.contentDetails.duration),
      viewCount: parseInt(details.statistics.viewCount, 10),
      createdAt: item.snippet.publishedAt,
      platform: 'youtube',
    });
  }
  return streams;
}

export async function fetchPlaylists(channelId: string): Promise<YouTubePlaylistMeta[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const url = new URL('https://www.googleapis.com/youtube/v3/playlists');
  url.searchParams.set('part', 'snippet,contentDetails');
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('maxResults', '50');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`YouTube playlists API error: ${response.status}`);
  }

  const data: YouTubePlaylistsResponse = await response.json();
  return data.items.map((item, index) => ({
    id: item.id,
    title: item.snippet.title,
    thumbnailUrl: pickThumbnail(item.snippet.thumbnails),
    itemCount: item.contentDetails.itemCount,
    position: index,
  }));
}

export async function fetchPlaylistItems(playlistId: string, maxItems: number): Promise<PastStream[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  // Step 1: List items in the playlist (preserving their order)
  const itemsUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
  itemsUrl.searchParams.set('part', 'snippet,contentDetails');
  itemsUrl.searchParams.set('playlistId', playlistId);
  itemsUrl.searchParams.set('maxResults', Math.min(maxItems, 50).toString());
  itemsUrl.searchParams.set('key', apiKey);

  const itemsResponse = await fetch(itemsUrl.toString());
  if (!itemsResponse.ok) {
    throw new Error(`YouTube playlistItems API error: ${itemsResponse.status}`);
  }

  const itemsData: YouTubePlaylistItemsResponse = await itemsResponse.json();
  const validItems = itemsData.items.filter(item => item.contentDetails.videoId);
  if (validItems.length === 0) return [];

  // Step 2: Get video details (duration + view count)
  const videoIds = validItems.map(item => item.contentDetails.videoId).join(',');
  const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  videosUrl.searchParams.set('part', 'contentDetails,statistics');
  videosUrl.searchParams.set('id', videoIds);
  videosUrl.searchParams.set('key', apiKey);

  const videosResponse = await fetch(videosUrl.toString());
  if (!videosResponse.ok) {
    throw new Error(`YouTube videos API error: ${videosResponse.status}`);
  }

  const videosData: YouTubeVideosResponse = await videosResponse.json();
  const detailsMap = new Map(videosData.items.map(item => [item.id, item]));

  const streams: PastStream[] = [];
  for (const item of validItems) {
    const videoId = item.contentDetails.videoId;
    const details = detailsMap.get(videoId);
    if (!details) continue;
    streams.push({
      id: videoId,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: pickThumbnail(item.snippet.thumbnails),
      duration: formatDuration(details.contentDetails.duration),
      viewCount: parseInt(details.statistics.viewCount, 10),
      createdAt: item.contentDetails.videoPublishedAt ?? new Date(0).toISOString(),
      platform: 'youtube',
    });
  }
  return streams;
}
