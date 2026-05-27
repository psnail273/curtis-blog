import React from 'react';
import type { CommandContext } from './index';

const twitchUsername = process.env.NEXT_PUBLIC_TWITCH_USERNAME;
const youtubeHandle = process.env.NEXT_PUBLIC_YOUTUBE_HANDLE;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function liveCommand(_args: string[], _context: CommandContext): React.ReactNode {
  return (
    <div className="space-y-3">
      <div className="text-accent">Streaming Channels</div>
      <div className="space-y-2">
        {twitchUsername && (
          <div className="flex items-center gap-3">
            <span className="text-muted w-20">Twitch:</span>
            <a
              href={`https://twitch.tv/${twitchUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              twitch.tv/{twitchUsername}
            </a>
          </div>
        )}
        {youtubeHandle && (
          <div className="flex items-center gap-3">
            <span className="text-muted w-20">YouTube:</span>
            <a
              href={`https://youtube.com/@${youtubeHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              youtube.com/@{youtubeHandle}
            </a>
          </div>
        )}
      </div>
      <p className="text-muted text-sm mt-3">
        Check the live indicator in the header for current streaming status.
      </p>
    </div>
  );
}
