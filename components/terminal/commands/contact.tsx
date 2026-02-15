import React from 'react';
import type { CommandContext } from './index';

const twitchUsername = process.env.NEXT_PUBLIC_TWITCH_USERNAME;
const youtubeHandle = process.env.NEXT_PUBLIC_YOUTUBE_HANDLE;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function contactCommand(_args: string[], _context: CommandContext): React.ReactNode {
  return (
    <div className="space-y-4">
      <div className="text-accent">Contact &amp; Social</div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <span className="text-muted w-24">Email:</span>
          <a
            href="mailto:curtis@example.com"
            className="text-accent hover:underline"
          >
            curtis@example.com
          </a>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-muted w-24">Twitter:</span>
          <a
            href="https://twitter.com/curtisisrael"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            @curtisisrael
          </a>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-muted w-24">GitHub:</span>
          <a
            href="https://github.com/curtisisrael"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            github.com/curtisisrael
          </a>
        </div>

        {twitchUsername && (
          <div className="flex items-start gap-3">
            <span className="text-muted w-24">Twitch:</span>
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
          <div className="flex items-start gap-3">
            <span className="text-muted w-24">YouTube:</span>
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

      <p className="text-muted text-sm mt-4">
        Feel free to reach out via any platform above.
      </p>
    </div>
  );
}
