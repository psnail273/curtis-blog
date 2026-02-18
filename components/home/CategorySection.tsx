import { Article } from '@/types/article';
import { MosaicCard } from './MosaicCard';

interface CategorySectionProps {
  articles: Article[];
  priority?: boolean;
}

/**
 * Editorial category layout: hero card on the left, remaining articles
 * stacked on the right. On mobile, hero is on top with articles below.
 */
export function CategorySection({ articles, priority = false }: CategorySectionProps) {
  if (articles.length === 0) return null;

  const heroArticle = articles[0];
  const restArticles = articles.slice(1);

  // Single article — just render the hero full-width
  if (restArticles.length === 0) {
    return <MosaicCard article={heroArticle} size="hero" priority={priority} showCategory={false} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
      {/* Left: Featured hero card */}
      <div className="lg:col-span-3">
        <MosaicCard article={heroArticle} size="hero" priority={priority} showCategory={false} />
      </div>

      {/* Right: Stacked article list, height-matched to hero */}
      <div className="lg:col-span-2 flex flex-col gap-4  lg:max-h-[500px]">
        {restArticles.map((article) => (
          <MosaicCard key={article.id} article={article} size="small" showCategory={false} />
        ))}
      </div>
    </div>
  );
}
