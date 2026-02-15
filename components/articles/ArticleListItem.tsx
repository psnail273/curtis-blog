import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/article';
import { cn } from '@/lib/utils';

interface ArticleListItemProps {
  article: Article;
  isLast?: boolean;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function ArticleListItem({ article, isLast = false }: ArticleListItemProps) {
  return (
    <>
      <Link
        href={`/articles/${article.slug}`}
        aria-label={`Read article: ${article.title}`}
        className="block group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-all duration-200 hover:bg-accent/5 rounded-lg p-4 -mx-4"
      >
        <article className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-4 md:gap-6">
          {/* Text content */}
          <div className="flex flex-col">
            {/* Metadata row */}
            <div className="flex items-center gap-2 flex-wrap mb-2 md:mb-3">
              {/* Category badge */}
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent">
                {article.category}
              </span>

              {/* Date */}
              <time dateTime={article.publishedAt} className="text-xs text-caption">
                {formatDate(article.publishedAt)}
              </time>

              {/* Dot separator */}
              <span className="text-caption text-xs" aria-hidden="true">&middot;</span>

              {/* Read time */}
              <span className="text-xs text-caption">{article.readTime} min</span>
            </div>

            {/* Title */}
            <h3
              className={cn(
                'font-serif font-semibold text-foreground',
                'text-xl md:text-2xl',
                'leading-[1.25] tracking-[-0.01em]',
                'mb-2 md:mb-3',
                'line-clamp-2 md:line-clamp-3',
                'transition-colors duration-200 group-hover:text-accent'
              )}
            >
              {article.title}
            </h3>

            {/* Excerpt */}
            <p className="text-sm md:text-base leading-[1.6] text-muted line-clamp-4">
              {article.excerpt}
            </p>
          </div>

          {/* Thumbnail (if available) - shown on right for desktop, top for mobile */}
          {article.coverImage && (
            <div className="relative w-full md:w-[120px] h-[200px] md:h-[120px] rounded-md overflow-hidden order-first md:order-last">
              <Image
                src={article.coverImage}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 120px"
                className="object-cover"
              />
            </div>
          )}
        </article>
      </Link>

      {/* Divider */}
      {!isLast && <div className="border-b border-border my-4 md:my-5" />}
    </>
  );
}
