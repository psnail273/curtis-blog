import { type PastStream, formatTwitchDuration } from './stream-utils';

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchStreamData {
  id: string;
  user_login: string;
  type: 'live' | '';
  user_name?: string;
  game_name?: string;
  viewer_count?: number;
  started_at?: string;
}

interface TwitchStreamsResponse {
  data: TwitchStreamData[];
}

interface TwitchVideo {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  view_count: number;
  duration: string;
  created_at: string;
}

interface TwitchVideosResponse {
  data: TwitchVideo[];
}

interface TwitchUsersResponse {
  data: Array<{ id: string; login: string; display_name: string }>;
}

// In-memory token cache
let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Twitch access token: ${response.status}`);
  }

  const data: TwitchTokenResponse = await response.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 3600) * 1000,
  };

  return data.access_token;
}

export async function checkStreamStatus(channelName: string): Promise<boolean> {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${channelName}`,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID!,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitch API error: ${response.status}`);
    }

    const data: TwitchStreamsResponse = await response.json();
    return data.data.length > 0 && data.data[0].type === 'live';
  } catch (error) {
    console.error('Error checking Twitch stream status:', error);
    return false;
  }
}

export async function fetchPastStreams(username: string): Promise<PastStream[]> {
  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) return [];

  const token = await getAccessToken();
  const headers = {
    'Client-ID': process.env.TWITCH_CLIENT_ID!,
    'Authorization': `Bearer ${token}`,
  };

  // Step 1: Resolve username to user_id
  const usersRes = await fetch(
    `https://api.twitch.tv/helix/users?login=${username}`,
    { headers }
  );
  if (!usersRes.ok) throw new Error(`Twitch users API error: ${usersRes.status}`);

  const usersData: TwitchUsersResponse = await usersRes.json();
  if (usersData.data.length === 0) return [];

  const userId = usersData.data[0].id;

  // Step 2: Fetch videos (past broadcasts)
  const videosUrl = new URL('https://api.twitch.tv/helix/videos');
  videosUrl.searchParams.set('user_id', userId);
  videosUrl.searchParams.set('type', 'archive');
  videosUrl.searchParams.set('first', '50');

  const videosRes = await fetch(videosUrl.toString(), { headers });
  if (!videosRes.ok) throw new Error(`Twitch videos API error: ${videosRes.status}`);

  const videosData: TwitchVideosResponse = await videosRes.json();

  return videosData.data.map((video) => ({
    id: video.id,
    title: video.title,
    url: video.url,
    thumbnailUrl: video.thumbnail_url.replace('%{width}', '640').replace('%{height}', '360'),
    duration: formatTwitchDuration(video.duration),
    viewCount: video.view_count,
    createdAt: video.created_at,
    platform: 'twitch' as const,
  }));
}
