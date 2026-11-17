function NewsCard({ article, isSaved, onSave }) {
  return (
    <article className="news-card">
      <img src={article.image} alt={article.title} />

      <div className="news-content">
        <h3>{article.title}</h3>
        <p>Release Date: {article.released || "Unknown"}</p>
        <p>Rating: {article.rating}/5</p>
        <p>Platforms: {article.platforms.join(", ")}</p>
        <p>{article.description.slice(0, 120)}...</p>

        <div className="news-actions">
          <a
            href={`https://rawg.io/games/${article.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read More
          </a>
          <button
            className={`save-button${isSaved ? " saved" : ""}`}
            type="button"
            aria-pressed={isSaved}
            onClick={() => onSave(article)}
          >
            {isSaved ? "★ Saved" : "☆ Save"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default NewsCard;
