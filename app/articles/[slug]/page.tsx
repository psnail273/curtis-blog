import { notFound } from 'next/navigation';
import Link from 'next/link';
import { mockArticles } from '@/lib/mock-articles';
import styles from './page.module.scss';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = mockArticles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <article>
      <Link href="/articles" className={styles.backLink}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        Back to articles
      </Link>

      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.badge}>
            {article.category}
          </span>
          <span>{article.readTime} min read</span>
        </div>

        <h1 className={styles.title}>{article.title}</h1>

        <div className={styles.authorInfo}>
          <span className={styles.authorName}>{article.author}</span>
          <span>·</span>
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        </div>
      </header>

      <div className={styles.content}>
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  return mockArticles.map((article) => ({
    slug: article.slug,
  }));
}
