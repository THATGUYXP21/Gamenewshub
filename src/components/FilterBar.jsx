const filters = [
  "All Games",
  "PlayStation",
  "Xbox",
  "Nintendo",
  "PC Gaming",
];

function FilterBar({ selectedFilter, setSelectedFilter }) {
  return (
    <div className="filter-bar" aria-label="Filter games by platform">
      {filters.map((filter) => (
        <button
          key={filter}
          className={`filter-button${selectedFilter === filter ? " selected" : ""}`}
          type="button"
          aria-pressed={selectedFilter === filter}
          onClick={() => setSelectedFilter(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;