import { resolveArticleOr404 } from './article-data';

interface ArticleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tag: string; slug: string }>;
}

/**
 * Validates the article up front. This runs above the loading.tsx Suspense
 * boundary, so notFound() here produces a real 404 status (see article-data.ts).
 */
export default async function ArticleLayout({ children, params }: ArticleLayoutProps) {
  const { tag, slug } = await params;
  await resolveArticleOr404(tag, slug);
  return children;
}
