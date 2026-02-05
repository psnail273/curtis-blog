'use client';

import { useState, useMemo } from 'react';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { CategoryFilter } from '@/components/articles/CategoryFilter';
import { Article } from '@/types/article';

interface ArticlesPageContentProps {
  articles: Article[];
  categories: string[];
}

export function ArticlesPageContent({
  articles,
  categories,
}: ArticlesPageContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    if (selectedCategory === null) {
      return articles;
    }
    return articles.filter((article) => article.category === selectedCategory);
  }, [articles, selectedCategory]);

  return (
    <div className="pb-12">
      {/* Page Header */}
      <header className="mb-10 md:mb-12">
        <h1>Articles</h1>
        <p
          className="text-lg mb-4 max-w-2xl"
          style={{ color: 'var(--text-muted)' }}
        >
          Thoughts on politics, gaming, education, tech, and whatever else is on my mind.
        </p>
        <div
          className="w-12 h-[3px] rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
          aria-hidden="true"
        />
      </header>

      {/* Category filter */}
      <div className="mb-6">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <p
          className="text-center py-16 text-lg"
          style={{ color: 'var(--text-muted)' }}
        >
          {selectedCategory
            ? `No articles found in "${selectedCategory}".`
            : 'No articles found.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
