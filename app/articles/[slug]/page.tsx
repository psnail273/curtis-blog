import { notFound } from 'next/navigation';
import Link from 'next/link';
import { mockArticles } from '@/lib/mock-articles';

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
      <Link
        href="/articles"
        className="inline-flex items-center gap-2 text-text-muted hover:text-accent mb-6 text-sm"
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
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        Back to articles
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3 text-sm text-text-muted mb-4">
          <span className="px-2 py-1 bg-accent/10 text-accent rounded-md text-xs font-medium">
            {article.category}
          </span>
          <span>{article.readTime} min read</span>
        </div>

        <h1 className="mb-4">{article.title}</h1>

        <div className="flex items-center gap-2 text-text-muted">
          <span className="font-medium text-foreground">{article.author}</span>
          <span>·</span>
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        </div>
      </header>

      <div className="prose prose-warm max-w-none">
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-4 text-text-body leading-relaxed">
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
