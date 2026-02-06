import React from 'react';

export function contactCommand(): React.ReactNode {
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

        <div className="flex items-start gap-3">
          <span className="text-muted w-24">Twitch:</span>
          <a
            href="https://twitch.tv/curtisisrael"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            twitch.tv/curtisisrael
          </a>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-muted w-24">YouTube:</span>
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

      <p className="text-muted text-sm mt-4">
        Feel free to reach out via any platform above.
      </p>
    </div>
  );
}
