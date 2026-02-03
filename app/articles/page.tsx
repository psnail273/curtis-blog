import { ArticleCard } from '@/components/articles/ArticleCard';
import { mockArticles } from '@/lib/mock-articles';
import styles from './page.module.scss';

export default function Articles() {
  const articles = mockArticles;

  return (
    <div>
      <h1>Articles</h1>
      <p className={styles.description}>
        Browse all articles and posts.
      </p>

      {articles.length === 0 ? (
        <p className={styles.emptyState}>No articles found.</p>
      ) : (
        <div className={styles.grid}>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
