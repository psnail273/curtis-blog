import type { Metadata } from 'next';
import { mockArticles } from '@/lib/mock-articles';
import { ArticlesPageContent } from './ArticlesPageContent';

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Thoughts on politics, gaming, education, tech, and whatever else is on my mind.',
  openGraph: {
    title: 'Articles | Curtis Israel',
    description: 'Thoughts on politics, gaming, education, tech, and whatever else is on my mind.',
    url: '/articles',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Articles | Curtis Israel',
    description: 'Thoughts on politics, gaming, education, tech, and whatever else is on my mind.',
  },
};

export default function Articles() {
  const articles = mockArticles;

  // Extract unique categories, sorted alphabetically for consistent order
  const categories = Array.from(
    new Set(articles.map((article) => article.category))
  ).sort();

  return <ArticlesPageContent articles={articles} categories={categories} />;
}
