interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchStreamData {
  id: string;
  user_login: string;
  type: 'live' | '';
  // Additional fields from Twitch API (not exhaustive)
  user_name?: string;
  game_name?: string;
  viewer_count?: number;
  started_at?: string;
}

interface TwitchStreamsResponse {
  data: TwitchStreamData[];
}

// In-memory token cache
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Check if cached token is still valid
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  // Fetch new token from Twitch OAuth
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

  // Cache token (expire 1 hour before actual expiry for safety)
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

    // If data array has items and type is 'live', channel is streaming
    return data.data.length > 0 && data.data[0].type === 'live';
  } catch (error) {
    console.error('Error checking Twitch stream status:', error);
    return false; // Fail safely to offline state
  }
}
