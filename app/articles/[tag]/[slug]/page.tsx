export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { articleHref } from '@/lib/article-utils';
import { ArticleByline } from '@/components/articles/ArticleByline';
import { ArticleContent } from '@/components/articles/ArticleContent';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { resolveArticleOr404 } from './article-data';

interface ArticlePageProps {
  params: Promise<{ tag: string; slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { tag, slug } = await params;
  const article = await resolveArticleOr404(tag, slug);

  const description = article.excerpt || article.content.substring(0, 160);

  return {
    title: article.title,
    description,
    ...(article.status === 'draft' && { robots: { index: false, follow: false } }),
    openGraph: {
      title: article.title,
      description,
      url: articleHref(article),
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
  const { tag, slug } = await params;
  const article = await resolveArticleOr404(tag, slug);

  const isDraft = article.status !== 'published';

  return (
    <article>
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

        {/* Byline — editorial style, with share action */}
        <ArticleByline
          author={article.author}
          publishedAt={article.published_at}
          readTime={article.read_time}
        />
      </header>

      {/* Article body — Markdown rendered */}
      <ArticleContent content={article.content} />

      {/* Separator */}
      <hr className="border-t border-border my-[var(--section-gap-mobile)] md:my-[var(--section-gap)]" />

      {/* Comments Section */}
      <Suspense fallback={<CommentsSkeleton />}>
        <CommentsSection slug={slug} />
      </Suspense>
    </article>
  );
}

function CommentsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-36 bg-border rounded mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-8 w-8 bg-border rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-border rounded" />
              <div className="h-4 w-full bg-border rounded" />
              <div className="h-4 w-2/3 bg-border rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
