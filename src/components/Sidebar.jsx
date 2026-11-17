const categories = [
  "Dashboard",
  "Latest News",
  "PlayStation",
  "Xbox",
  "Nintendo",
  "PC Gaming",
  "Esports",
  "Updates",
  "Saved Articles",
];

function Sidebar({ activePage, onSelect, updateCount }) {
  return (
    <aside className="sidebar">
      <h3 className="sidebar-heading">MENU</h3>

      <nav>
        {categories.map((category) => (
            <button
              key={category}
              className={`sidebar-link ${
                activePage === category ? "active" : ""
              }`}
              type="button"
              onClick={() => onSelect(category)}
            >
              {category}
              {category === "Updates" && updateCount > 0 && (
                <span className="sidebar-update-count" aria-label={`${updateCount} unread updates`}>
                  {updateCount}
                </span>
              )}
            </button>
        ))}
      </nav>

        <div className="sidebar-footer">
            <p>Game News Hub</p>
            <small>Stay in the game.</small>
        </div>

    </aside>
  )
}

export default Sidebar;