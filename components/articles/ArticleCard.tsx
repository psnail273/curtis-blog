import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Article } from '@/types/article';
import styles from './ArticleCard.module.scss';

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
    <Link href={`/articles/${article.slug}`} className={styles.link}>
      <Card className={`${styles.card} shadow-warm`}>
        <CardHeader className={styles.header}>
          <div className={styles.meta}>
            <span className={styles.badge}>
              {article.category}
            </span>
            <span className={styles.readTime}>{article.readTime} min read</span>
          </div>
          <CardTitle className={styles.title}>
            {article.title}
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.content}>
          <p className={styles.excerpt}>
            {article.excerpt}
          </p>
          <div className={styles.footer}>
            <span>{article.author}</span>
            <span className={styles.separator}>·</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
