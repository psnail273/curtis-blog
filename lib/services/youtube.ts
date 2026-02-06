interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string };
    snippet: {
      liveBroadcastContent: 'live' | 'none' | 'upcoming';
      channelId: string;
      channelTitle: string;
    };
  }>;
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
    return { isLive: false }; // Fail safely to offline state
  }
}
