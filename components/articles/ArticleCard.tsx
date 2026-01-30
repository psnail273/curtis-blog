import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
    <Link href={`/articles/${article.slug}`} className="block h-full">
      <Card className="h-full transition-all duration-200 hover:shadow-warm-lg hover:-translate-y-1 cursor-pointer border-border shadow-warm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-sm mb-2">
            <span className="px-2 py-1 bg-accent/10 text-accent rounded-md text-xs font-medium">
              {article.category}
            </span>
            <span className="text-text-muted">{article.readTime} min read</span>
          </div>
          <CardTitle className="line-clamp-2 text-lg leading-snug">
            {article.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-text-muted line-clamp-3 text-sm">
            {article.excerpt}
          </p>
          <div className="mt-4 text-sm text-text-muted">
            <span>{article.author}</span>
            <span className="mx-2">·</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
