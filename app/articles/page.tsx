import { mockArticles } from '@/lib/mock-articles';
import { ArticlesPageContent } from './ArticlesPageContent';

export default function Articles() {
  const articles = mockArticles;

  // Extract unique categories, sorted alphabetically for consistent order
  const categories = Array.from(
    new Set(articles.map((article) => article.category))
  ).sort();

  return <ArticlesPageContent articles={articles} categories={categories} />;
}
