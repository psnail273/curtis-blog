import { Article } from '@/types/article';
import { MosaicCard } from './MosaicCard';
import { getCategoryStyle } from '@/lib/category-colors';

interface CategoryFilterViewProps {
  articles: Article[];
  category: string;
  priority?: boolean;
}

export function CategoryFilterView({
  articles,
  category,
  priority = false,
}: CategoryFilterViewProps) {
  if (articles.length === 0) return null;

  const featuredArticle = articles[0];
  const restArticles = articles.slice(1);

  return (
    <div className="flex flex-col gap-4 md:gap-6" style={getCategoryStyle(category)}>
      {/* Full-width hero card */}
      <MosaicCard
        article={featuredArticle}
        size="hero"
        priority={priority}
        showCategory={false}
        featured
      />

      {/* 4-column grid of remaining articles */}
      {restArticles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 fluid-hover-grid">
          {restArticles.map((article) => (
            <MosaicCard
              key={article.id}
              article={article}
              size="medium"
              showCategory={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
