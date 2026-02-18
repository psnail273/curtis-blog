import { Article } from '@/types/article';
import { MosaicCard } from './MosaicCard';

interface HeroMosaicProps {
  articles: Article[];
}

export function HeroMosaic({ articles }: HeroMosaicProps) {
  // Ensure we have exactly 6 articles (or fewer)
  const displayArticles = articles.slice(0, 6);

  if (displayArticles.length === 0) {
    return null;
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Article 1: Large hero card (2x2 on desktop) */}
      {displayArticles[0] && (
        <div className="lg:col-span-2 lg:row-span-2">
          <MosaicCard article={displayArticles[0]} size="hero" priority={true} />
        </div>
      )}

      {/* Article 2: Medium card (top right on desktop) */}
      {displayArticles[1] && (
        <div className="lg:col-span-1 lg:row-span-1">
          <MosaicCard article={displayArticles[1]} size="medium" />
        </div>
      )}

      {/* Article 3: Small card (middle right on desktop) */}
      {displayArticles[2] && (
        <div className="lg:col-span-1 lg:row-span-1">
          <MosaicCard article={displayArticles[2]} size="small" />
        </div>
      )}

      {/* Article 4: Medium card (bottom row left) */}
      {displayArticles[3] && (
        <div className="lg:col-span-1">
          <MosaicCard article={displayArticles[3]} size="medium" />
        </div>
      )}

      {/* Article 5: Small card (bottom row center) */}
      {displayArticles[4] && (
        <div className="lg:col-span-1">
          <MosaicCard article={displayArticles[4]} size="small" />
        </div>
      )}

      {/* Article 6: Small card (bottom row right) */}
      {displayArticles[5] && (
        <div className="lg:col-span-1">
          <MosaicCard article={displayArticles[5]} size="small" />
        </div>
      )}
    </section>
  );
}
