import NewsCard from "./NewsCard";

function SavedArticles({ articles, onRemove, onSave }) {
  return (
    <section className="saved-section">
      <h2>My Saved Articles</h2>

      <p className="section-description">
        Your favorite gaming news in one place.
      </p>

      {articles.length === 0 ? (
        <div className="empty-state">
          <span>☆</span>
          <h3>No saved articles yet</h3>
          <p>Save an article to read it later.</p>
        </div>
      ) : (
        <div className="news-grid">
          {articles.map((article) => (
            <div key={article.id}>
              <NewsCard
                article={article}
                isSaved={true}
                onSave={onSave}
              />
              <button
                className="remove-button"
                type="button"
                onClick={() => onRemove(article.id)}
              >
                Remove Article
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default SavedArticles;