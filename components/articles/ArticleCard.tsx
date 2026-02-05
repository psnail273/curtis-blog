import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Article } from '@/types/article';

interface ArticleCardProps {
  article: Article;
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

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className={cn(
        'block h-full rounded-xl',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
      )}
    >
      <Card
        className={cn(
          'h-full cursor-pointer',
          'border-border shadow-warm',
          'transition-all duration-200',
          'hover:shadow-warm-hover hover:-translate-y-1 hover:border-accent/30'
        )}
      >
        <CardHeader className="pb-2">
          {/* Meta row: category badge + read time */}
          <div className="flex items-center gap-2 text-sm mb-2">
            <span
              className={cn(
                'px-2.5 py-1 rounded-md',
                'text-xs font-medium',
                'bg-accent/10 text-accent'
              )}
            >
              {article.category}
            </span>
            <span className="text-muted-foreground text-xs">
              {article.readTime} min read
            </span>
          </div>

          {/* Title: serif font for editorial feel */}
          <CardTitle
            className={cn(
              'line-clamp-2 text-lg leading-[1.4]',
              'font-serif font-semibold text-foreground'
            )}
          >
            {article.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Excerpt */}
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
            {article.excerpt}
          </p>

          {/* Metadata footer */}
          <div
            className={cn(
              'mt-4 pt-3 text-xs text-muted-foreground/70',
              'border-t border-border/50'
            )}
          >
            <span>{article.author}</span>
            <span className="mx-2" aria-hidden="true">&middot;</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
