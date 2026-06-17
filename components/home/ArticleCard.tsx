import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/article';
import { cn } from '@/lib/utils';
import { getCategoryStyle } from '@/lib/category-colors';
import { articleHref } from '@/lib/article-utils';
import { formatDateLong } from '@/lib/format-utils';

interface ArticleCardProps {
  article: Article;
  priority?: boolean;
}

export function ArticleCard({ article, priority = false }: ArticleCardProps) {
  return (
    <Link
      href={articleHref(article)}
      aria-label={`Read article: ${article.title}`}
      className="block group h-fit md:h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <article
        className={cn(
          'flex flex-col sm:flex-row border border-border rounded-lg overflow-hidden',
          'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          'hover:shadow-warm-hover',
          'bg-card category-hover-border category-hover-edge'
        )}
        style={getCategoryStyle(article.category)}
      >
        {/* Cover image — top on mobile, left side on desktop */}
        {article.coverImage && (
          <div className="relative w-full aspect-[3/2] sm:w-48 md:w-56 sm:aspect-auto shrink-0">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, 224px"
              className="object-cover"
            />
          </div>
        )}

        {/* Content — right side on desktop, below image on mobile */}
        <div className="flex flex-col flex-1 p-4 md:p-5 space-y-2">
          {!article.coverImage && article.status === 'draft' && (
            <span className="self-start bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wide">
              Draft
            </span>
          )}
          <h3 className="font-serif text-lg md:text-xl font-medium text-foreground line-clamp-2 leading-[1.25] transition-colors duration-200 group-hover:text-accent">
            {article.title}
          </h3>
          <p className="font-serif text-sm text-muted line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-2 flex-wrap text-caption text-xs mt-auto">
            <span className="font-semibold text-foreground/80">{article.author}</span>
            <span aria-hidden="true">&middot;</span>
            <time dateTime={article.publishedAt ?? undefined}>
              {formatDateLong(article.publishedAt)}
            </time>
            <span aria-hidden="true">&middot;</span>
            <span>{article.readTime} min read</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
