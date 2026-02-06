import React from 'react';

export function liveCommand(): React.ReactNode {
  return (
    <div className="space-y-3">
      <div className="text-accent">Streaming Channels</div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-muted w-20">Twitch:</span>
          <a
            href="https://twitch.tv/curtisisrael"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            twitch.tv/curtisisrael
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted w-20">YouTube:</span>
          <a
            href="https://youtube.com/@curtisisrael"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            youtube.com/@curtisisrael
          </a>
        </div>
      </div>
      <p className="text-muted text-sm mt-3">
        Check the live indicator in the header for current streaming status.
      </p>
    </div>
  );
}
