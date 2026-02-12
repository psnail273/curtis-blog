import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDb } from '@/lib/db';

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string;
  category: string;
  read_time: number;
  status: string;
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function getPublishedArticle(slug: string): Promise<ArticleRow | null> {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM articles WHERE slug = ${slug} AND status = 'published'
    ` as ArticleRow[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
      robots: { index: false, follow: true },
    };
  }

  const description = article.excerpt || article.content.substring(0, 160);

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      url: `/articles/${article.slug}`,
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.author],
      tags: [article.category],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
    },
  };
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
  const article = await getPublishedArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto">
      <Link
        href="/articles"
        className="inline-flex items-center gap-2 text-muted mb-8 text-sm"
      >
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
          aria-hidden="true"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        Back to articles
      </Link>

      <header className="mb-12">
        <div className="flex items-center gap-3 flex-wrap text-sm text-muted mb-6">
          <span className="px-2 py-1 bg-accent/10 text-accent rounded-md text-xs font-medium">
            {article.category}
          </span>
          <span>{article.read_time} min read</span>
        </div>

        <h1 className="mb-6">{article.title}</h1>

        <div className="flex items-center gap-2 flex-wrap text-muted">
          <span className="font-medium text-foreground">{article.author}</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={article.published_at}>
            {formatDate(article.published_at)}
          </time>
        </div>
      </header>

      <div className="max-w-none">
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-6 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT slug FROM articles WHERE status = 'published'
    ` as { slug: string }[];
    return rows.map((row) => ({ slug: row.slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
