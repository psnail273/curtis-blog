import { ArticleCard } from '@/components/articles/ArticleCard';
import { mockArticles } from '@/lib/mock-articles';

export default function Articles() {
  const articles = mockArticles;

  return (
    <div>
      <h1>Articles</h1>
      <p className="text-text-muted mb-8">
        Browse all articles and posts.
      </p>

      {articles.length === 0 ? (
        <p className="text-text-muted">No articles found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
