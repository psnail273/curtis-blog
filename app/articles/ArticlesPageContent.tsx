'use client';

import { useState, useMemo } from 'react';
import { EditorialArticleItem } from '@/components/articles/EditorialArticleItem';
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
    <div className="max-w-3xl mx-auto pb-16">
      {/* Enhanced Page Header */}
      <header className="mb-12 md:mb-16">
        <h1 className="mb-6">
          Articles
        </h1>

        <p className="text-lg md:text-xl leading-relaxed mb-6 max-w-2xl text-muted">
          Thoughts on politics, gaming, education, tech, and whatever else is on my mind.
        </p>

        {/* Decorative separator */}
        <div
          className="w-16 h-[3px] rounded-full bg-accent"
          aria-hidden="true"
        />
      </header>

      {/* Category filter */}
      <div className="mb-8 md:mb-14">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Articles List - Single Column */}
      {filteredArticles.length === 0 ? (
        <p className="text-center py-20 text-lg md:text-xl text-muted">
          {selectedCategory
            ? `No articles found in "${selectedCategory}".`
            : 'No articles found.'}
        </p>
      ) : (
        <div className="flex flex-col">
          {filteredArticles.map((article, index) => (
            <div
              key={article.id}
              className={
                index < filteredArticles.length - 1
                  ? 'pb-12 mb-16 border-b border-border'
                  : ''
              }
            >
              <EditorialArticleItem
                article={article}
                featured={index === 0}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
