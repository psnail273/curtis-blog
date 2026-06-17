import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/article';
import { cn } from '@/lib/utils';
import { getCategoryStyle } from '@/lib/category-colors';
import { articleHref } from '@/lib/article-utils';
import { formatDateLong } from '@/lib/format-utils';

interface MosaicCardProps {
  article: Article;
  size: 'hero' | 'medium' | 'small';
  priority?: boolean;
  showCategory?: boolean;
  featured?: boolean;
  className?: string;
}

export function MosaicCard({ article, size, priority = false, showCategory = true, featured = false, className }: MosaicCardProps) {
  return (
    <Link
      href={articleHref(article)}
      aria-label={`Read article: ${article.title}`}
      className={cn("block h-full group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", className)}
    >
      <article
        className={cn(
          'relative h-full flex flex-col border border-border rounded-lg overflow-hidden',
          'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          'hover:shadow-warm-hover',
          'bg-card category-hover-border category-hover-edge',
          featured && 'category-glow-static'
        )}
        style={getCategoryStyle(article.category)}
      >
        {/* Cover Image - all sizes when available */}
        {article.coverImage && (
          <div className={cn(
            'relative w-full shrink-0',
            size === 'hero' ? 'aspect-[16/9]' :
              size === 'medium' ? 'aspect-[4/3]' :
                'aspect-[3/2]'
          )}>
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority={priority}
              sizes={
                size === 'hero'
                  ? '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw'
                  : size === 'medium'
                    ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                    : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
              }
              className="object-contain"
            />
          </div>
        )}

        {/* Content */}
        <div className={cn(
          'flex flex-col flex-1',
          size === 'hero' ? 'p-6 md:p-8 space-y-4 md:space-y-5' :
            size === 'medium' ? 'p-5 md:p-6 space-y-3 md:space-y-4' :
              'p-4 md:p-5 space-y-2.5'
        )}>

          {/* Title */}
          <h3
            className={cn(
              'font-serif text-foreground transition-colors duration-200 group-hover:text-accent',
              size === 'hero'
                ? 'text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-[-0.025em]'
                : size === 'medium'
                  ? 'text-xl md:text-2xl font-semibold line-clamp-2 leading-[1.2]'
                  : 'text-lg md:text-xl font-medium line-clamp-2 leading-[1.25]'
            )}
          >
            {article.title}
          </h3>

          {/* Excerpt — serif for editorial tone */}
          <p className={cn(
            'font-serif text-muted leading-relaxed',
            size === 'hero' ? 'text-lg md:text-xl line-clamp-3' :
              size === 'medium' ? 'text-sm line-clamp-2' :
                'text-sm line-clamp-1'
          )}>
            {article.excerpt}
          </p>

          {/* Byline — all sizes show author for editorial feel */}
          <div className={cn(
            'flex items-center gap-2 flex-wrap text-caption mt-auto',
            size === 'hero' ? 'text-sm' : 'text-xs'
          )}>
            {showCategory && (
              <>
                <span className="category-bg category-color px-1.5 py-0.5 rounded text-xs font-medium uppercase tracking-wide">
                  {article.category}
                </span>
                <span aria-hidden="true">&middot;</span>
              </>
            )}
            <span className="font-semibold text-foreground/80">{article.author}</span>
            <span aria-hidden="true">&middot;</span>
            <time dateTime={article.publishedAt ?? undefined}>
              {formatDateLong(article.publishedAt)}
            </time>
            {size !== 'small' && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span>{article.readTime} min read</span>
              </>
            )}
            {article.status === 'draft' && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                  Draft
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
