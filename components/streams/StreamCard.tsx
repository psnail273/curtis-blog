import Image from 'next/image';
import { formatDateShort } from '@/lib/format-utils';

interface StreamCardProps {
  stream: {
    id: string;
    title: string;
    url: string;
    thumbnailUrl: string;
    duration: string;
    viewCount: number;
    createdAt: string;
    platform: 'twitch' | 'youtube';
  };
}

function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function StreamCard({ stream }: StreamCardProps) {
  return (
    <a
      href={stream.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Watch ${stream.title} from ${formatDateShort(stream.createdAt)}`}
      className="block group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <article className="border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-warm-hover hover:-translate-y-1 bg-card">
        {/* Thumbnail with overlay badges — scale on hover for video feel */}
        <div className="relative aspect-[16/9] bg-muted overflow-hidden">
          <Image
            src={stream.thumbnailUrl}
            alt={stream.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />

          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-medium rounded">
            {stream.duration}
          </div>

          {/* Platform badge */}
          <div className="absolute top-2 left-2 p-1 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full">
            {stream.platform === 'twitch' ? (
              <svg
                className="w-6 h-6 text-[#9146FF]"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-[#FF0000]"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-2 mb-2 transition-colors duration-200 group-hover:text-accent">
            {stream.title}
          </h3>

          {/* Metadata */}
          <p className="text-sm text-muted">
            {formatDateShort(stream.createdAt)} &middot; {formatViewCount(stream.viewCount)} views
          </p>
        </div>
      </article>
    </a>
  );
}
