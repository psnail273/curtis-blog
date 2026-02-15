import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/article';
import { cn } from '@/lib/utils';

interface FeaturedArticleProps {
  article: Article;
  priority?: boolean;
  size?: 'default' | 'compact';
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

export function FeaturedArticle({ article, priority = false, size = 'default' }: FeaturedArticleProps) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      aria-label={`Read article: ${article.title}`}
      className="block h-full group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <article className="relative h-full flex flex-col p-6 md:p-8 border-l-4 border-accent transition-all duration-200 hover:shadow-lg overflow-hidden">
        {/* Cover Image (if available) */}
        {article.coverImage && (
          <div className="relative w-full aspect-[16/9] md:aspect-[2/1] rounded-lg overflow-hidden mb-4 md:mb-5 shrink-0">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
              className="object-cover"
            />
          </div>
        )}

        {/* Metadata row */}
        <div className="flex items-center gap-3 flex-wrap mb-4 md:mb-5 shrink-0">
          {/* Category badge */}
          <span className="px-2.5 py-1 rounded-md text-sm font-medium bg-accent/10 text-accent">
            {article.category}
          </span>

          {/* Dot separator */}
          <span className="text-muted" aria-hidden="true">&middot;</span>

          {/* Author */}
          <span className="text-sm text-muted">{article.author}</span>

          {/* Dot separator */}
          <span className="text-muted" aria-hidden="true">&middot;</span>

          {/* Date */}
          <time dateTime={article.publishedAt} className="text-sm text-muted">
            {formatDate(article.publishedAt)}
          </time>

          {/* Dot separator */}
          <span className="text-muted" aria-hidden="true">&middot;</span>

          {/* Read time */}
          <span className="text-sm text-muted">{article.readTime} min read</span>
        </div>

        {/* Title */}
        <h2
          className={cn(
            'font-serif font-semibold text-foreground shrink-0',
            size === 'compact' ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-3xl md:text-4xl lg:text-5xl',
            'leading-[1.15] tracking-[-0.02em]',
            'mb-4 md:mb-5',
            'transition-colors duration-200 group-hover:text-accent'
          )}
        >
          {article.title}
        </h2>

        {/* Excerpt */}
        <p className="text-lg md:text-xl leading-[1.7] text-muted shrink-0">
          {article.excerpt}
        </p>

        {/* Article content preview - fills remaining space */}
        {article.content && (
          <div className="mt-4 md:mt-5 min-h-0 flex-1 overflow-hidden">
            <div className="border-t border-border pt-4 md:pt-5 h-full overflow-hidden">
              <p className="text-sm md:text-base leading-[1.8] text-muted/80 whitespace-pre-line">
                {article.content}
              </p>
            </div>
          </div>
        )}
      </article>
    </Link>
  );
}
