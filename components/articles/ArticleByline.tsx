import { formatDateLong } from '@/lib/format-utils';
import { ShareButton } from '@/components/articles/ShareButton';

interface ArticleBylineProps {
  author: string;
  publishedAt: string | null;
  readTime: number;
}

export function ArticleByline({ author, publishedAt, readTime }: ArticleBylineProps) {
  return (
    <div className="flex items-center justify-between gap-3 pt-5 border-t border-border">
      <div className="flex flex-col">
        <span className="font-sans text-sm font-semibold text-foreground tracking-wide">
          By {author}
        </span>
        <div className="flex items-center gap-2 text-caption text-xs mt-0.5">
          <time dateTime={publishedAt ?? undefined}>
            {formatDateLong(publishedAt)}
          </time>
          <span aria-hidden="true">&middot;</span>
          <span>{readTime} min read</span>
        </div>
      </div>
      <ShareButton />
    </div>
  );
}
