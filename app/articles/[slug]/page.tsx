import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { getDb } from '@/lib/db';
import type { ArticleRow } from '@/lib/article-utils';
import { formatDateLong } from '@/lib/format-utils';
import { ArticleContent } from '@/components/articles/ArticleContent';

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
      publishedTime: article.published_at ?? undefined,
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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <article>
      <div className="max-w-prose mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-accent mb-8 text-sm transition-all duration-200 hover:translate-x-[-4px]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to articles
        </Link>
      </div>

      {/* Cover Image Hero — wider than prose for editorial impact */}
      {article.cover_image && (
        <div className="relative w-full max-w-4xl mx-auto aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden mb-8 md:mb-12">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 896px"
            className="object-cover"
          />
        </div>
      )}

      <div className="max-w-prose mx-auto">
        <header className="mb-8 md:mb-12">
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
                <time dateTime={article.published_at ?? undefined}>
                  {formatDateLong(article.published_at)}
                </time>
                <span aria-hidden="true">&middot;</span>
                <span>{article.read_time} min read</span>
              </div>
            </div>
          </div>
        </header>

        {/* Article body — Markdown rendered */}
        <ArticleContent content={article.content} />

        {/* Separator */}
        <hr className="border-t border-border my-[var(--section-gap-mobile)] md:my-[var(--section-gap)]" />

        {/* Comments Section */}
        <CommentsSection slug={slug} />
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
