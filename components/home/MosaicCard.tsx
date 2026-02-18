import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/article';
import { cn } from '@/lib/utils';
import { getCategoryColor } from '@/lib/category-colors';

interface MosaicCardProps {
  article: Article;
  size: 'hero' | 'medium' | 'small';
  priority?: boolean;
  showCategory?: boolean;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function MosaicCard({ article, size, priority = false, showCategory = true }: MosaicCardProps) {
  const catColor = getCategoryColor(article.category);

  return (
    <Link
      href={`/articles/${article.slug}`}
      aria-label={`Read article: ${article.title}`}
      className="block h-full group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <article
        className={cn(
          'relative h-full flex flex-col border border-border rounded-lg overflow-hidden',
          'transition-all duration-200',
          'hover:shadow-warm-hover hover:-translate-y-1',
          'bg-card'
        )}
        style={{
          '--hover-border': catColor.light,
        } as React.CSSProperties}
        onMouseEnter={e => (e.currentTarget.style.borderColor = catColor.light)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '')}
      >
        {/* Cover Image - all sizes when available */}
        {article.coverImage && (
          <div className={cn(
            'relative w-full shrink-0',
            size === 'hero' ? 'aspect-[16/9]' :
              size === 'medium' ? 'aspect-[4/3] h-32 md:h-40' :
                'aspect-[3/2] h-24 md:h-28'
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
              className="object-cover"
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
          {/* Category badge — only shown in hero mosaic */}
          {showCategory && (
            <span
              className="px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wide w-fit"
              style={{
                backgroundColor: catColor.bgLight,
                color: catColor.light,
              }}
            >
              {article.category}
            </span>
          )}

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
            <span className="font-semibold text-foreground/80">{article.author}</span>
            <span aria-hidden="true">&middot;</span>
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
            {size !== 'small' && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span>{article.readTime} min read</span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
