import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { getDb } from '@/lib/db';
import type { ArticleRow } from '@/lib/article-utils';

const CommentsSection = dynamic(
  () => import('@/components/comments/CommentsSection').then(mod => ({ default: mod.CommentsSection }))
);

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
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
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
    <article className="max-w-prose mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted hover:text-accent mb-8 text-sm transition-all duration-200 hover:translate-x-[-4px]"
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

      {/* Cover Image Hero (if available) */}
      {article.cover_image && (
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden mb-8 md:mb-12">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
            className="object-cover"
          />
        </div>
      )}

      <header className="mb-8 md:mb-12">
        {/* Kicker — category label above headline */}
        <span className="inline-block uppercase text-xs tracking-[0.15em] font-semibold text-accent mb-4 md:mb-5">
          {article.category}
        </span>

        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground mb-5 md:mb-6">
          {article.title}
        </h1>

        {/* Dek — excerpt as subtitle if available */}
        {article.excerpt && (
          <p className="font-serif text-lg md:text-xl text-muted leading-relaxed mb-6 md:mb-8">
            {article.excerpt}
          </p>
        )}

        {/* Byline — editorial style */}
        <div className="flex items-center gap-3 pt-5 border-t border-border">
          <div className="flex flex-col">
            <span className="font-sans text-sm font-semibold text-foreground tracking-wide">
              By {article.author}
            </span>
            <div className="flex items-center gap-2 text-caption text-xs mt-0.5">
              <time dateTime={article.published_at}>
                {formatDate(article.published_at)}
              </time>
              <span aria-hidden="true">&middot;</span>
              <span>{article.read_time} min read</span>
            </div>
          </div>
        </div>
      </header>

      {/* Article body — serif prose with drop cap */}
      <div className="article-prose">
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className={index === 0 ? 'drop-cap' : undefined}>
            {paragraph}
          </p>
        ))}
      </div>

      {/* Separator */}
      <hr className="border-t border-border my-12 md:my-16" />

      {/* Comments Section */}
      <CommentsSection slug={slug} />
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
