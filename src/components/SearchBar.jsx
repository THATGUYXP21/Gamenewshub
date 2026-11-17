function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="search-container">
      <span className="search-icon">⌕</span>

      <input
        type="text"
        placeholder="Search any game title..."
        aria-label="Search games by title"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {searchTerm && (
        <button
          className="clear-search"
          type="button"
          aria-label="Clear search"
          onClick={() => setSearchTerm("")}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default SearchBar;