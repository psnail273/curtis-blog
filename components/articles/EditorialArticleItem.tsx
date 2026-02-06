import Link from 'next/link';
import { Article } from '@/types/article';

interface EditorialArticleItemProps {
  article: Article;
  featured?: boolean;
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

export function EditorialArticleItem({ article, featured = false }: EditorialArticleItemProps) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      aria-label={`Read article: ${article.title}`}
      className={`block group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        featured ? 'relative' : ''
      }`}
    >
      <article className={featured ? 'pl-6 md:pl-8 py-6 md:py-8' : ''}>
        {/* Visual accent for featured article */}
        {featured && (
          <div
            className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 rounded-full bg-accent"
            aria-hidden="true"
          />
        )}

        {/* Metadata row: category badge + author + date + read time */}
        <div className={`flex items-center gap-3 flex-wrap ${
          featured ? 'mb-4 md:mb-5' : 'mb-3 md:mb-4'
        }`}>
          {/* Category badge */}
          <span
            className="px-2.5 py-1 rounded-md text-sm font-medium bg-accent/10 text-accent"
          >
            {article.category}
          </span>

          {/* Author, date, read time */}
          <div className="flex items-center text-sm flex-wrap gap-y-1 max-w-full text-muted">
            <span>{article.author}</span>
            <span className="mx-2" aria-hidden="true">&middot;</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span className="mx-2" aria-hidden="true">&middot;</span>
            <span>{article.readTime} min read</span>
          </div>
        </div>

        {/* Large serif headline - enhanced when featured */}
        <h2
          className={`font-serif leading-tight tracking-tight text-foreground transition-colors duration-200 group-hover:text-accent ${
            featured
              ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
              : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
          }`}
        >
          {article.title}
        </h2>

        {/* Excerpt - enhanced when featured */}
        <p
          className={`leading-relaxed line-clamp-3 text-muted ${
            featured
              ? 'text-lg md:text-xl mt-4 md:mt-5'
              : 'text-base md:text-lg mt-3 md:mt-4'
          }`}
        >
          {article.excerpt}
        </p>
      </article>
    </Link>
  );
}
