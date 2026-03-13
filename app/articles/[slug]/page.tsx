export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import nextDynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { getDb } from '@/lib/db';
import type { ArticleRow } from '@/lib/article-utils';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { formatDateLong } from '@/lib/format-utils';
import { ArticleContent } from '@/components/articles/ArticleContent';

const CommentsSection = nextDynamic(
  () => import('@/components/comments/CommentsSection').then(mod => ({ default: mod.CommentsSection }))
);

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function getArticleBySlug(slug: string): Promise<ArticleRow | null> {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM articles WHERE slug = ${slug}
    ` as ArticleRow[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

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
    ...(article.status === 'draft' && { robots: { index: false, follow: false } }),
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
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Draft articles require admin authentication
  const isDraft = article.status !== 'published';
  if (isDraft) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      notFound();
    }
  }

  return (
    <article className="max-w-3xl mx-auto">
      {/* Draft preview banner — admin only */}
      {isDraft && (
        <div className="mb-6">
          <div className="px-4 py-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-sm font-medium">
            You are previewing a draft. This article is not published.
          </div>
        </div>
      )}

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted hover:text-accent mb-8 text-sm transition-all duration-200 hover:translate-x-[-4px]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to articles
      </Link>

      {/* Cover Image — fills container width, natural aspect ratio */}
      {article.cover_image && (
        <div className="mb-8 md:mb-12">
          <Image
            src={article.cover_image}
            alt={article.title}
            width={768}
            height={432}
            sizes="(max-width: 768px) 100vw, 768px"
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

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
