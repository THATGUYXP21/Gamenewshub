import { useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import SearchBar from './components/SearchBar'
import SavedArticles from './components/SavedArticles'
import Update from './components/Update'
import FilterBar from './components/FilterBar'
import NewsCard from './components/NewsCard'
import { getGameNews } from './api/GameNews'
import { getGamingUpdates } from './api/GameUpdates'
import './App.css'

const UPDATE_CHECK_INTERVAL = 15 * 60 * 1000;
const STORAGE_KEYS = {
  savedArticles: "gamenews:saved-articles",
  gameUpdates: "gamenews:updates",
  unreadUpdateCount: "gamenews:unread-updates",
  seenNewsIds: "gamenews:seen-update-ids",
  lastChecked: "gamenews:last-update-check",
};

function readLocalStorage(key, fallback, isValid) {
  try {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue === null) return fallback;

    const value = JSON.parse(storedValue);
    if (isValid(value)) return value;

    console.error(`Ignoring invalid localStorage data for "${key}".`);
  } catch (error) {
    console.error(`Could not read localStorage key "${key}":`, error);
  }

  return fallback;
}

function saveToLocalStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save localStorage key "${key}":`, error);
  }
}

function readLastChecked() {
  const timestamp = readLocalStorage(
    STORAGE_KEYS.lastChecked,
    null,
    (value) => value === null || typeof value === "string"
  );
  if (!timestamp) return null;

  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
}

function App() {
  const [ selectedFilter, setSelectedFilter ] = useState("All Games");
  const [ searchTerm, setSearchTerm ] = useState("");
  const [ activePage, setActivePage ] = useState("Dashboard");
  const [ articles, setArticles ] = useState(() =>
    readLocalStorage(
      STORAGE_KEYS.savedArticles,
      [],
      (value) => Array.isArray(value) && value.every((article) => article && article.id)
    )
  );
  const [ games, setGames ] = useState([]);
  const [ loading, setLoading ] = useState(true);
  const [ gameUpdates, setGameUpdates ] = useState(() =>
    readLocalStorage(
      STORAGE_KEYS.gameUpdates,
      [],
      (value) => Array.isArray(value) && value.every((update) => update && update.id)
    )
  );
  const [ unreadUpdateCount, setUnreadUpdateCount ] = useState(() =>
    readLocalStorage(
      STORAGE_KEYS.unreadUpdateCount,
      0,
      (value) => Number.isInteger(value) && value >= 0
    )
  );
  const [ seenNewsIds, setSeenNewsIds ] = useState(() =>
    readLocalStorage(
      STORAGE_KEYS.seenNewsIds,
      null,
      (value) => value === null || (Array.isArray(value) && value.every((id) => typeof id === "string"))
    )
  );
  const [ notificationPermission, setNotificationPermission ] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? window.Notification.permission
      : "unsupported"
  );
  const [ monitorStatus, setMonitorStatus ] = useState("Waiting for gaming news.");
  const [ lastChecked, setLastChecked ] = useState(readLastChecked);
  const seenNewsIdsRef = useRef(
    seenNewsIds === null ? null : new Set(seenNewsIds)
  );

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.savedArticles, articles);
  }, [articles]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.gameUpdates, gameUpdates);
  }, [gameUpdates]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.unreadUpdateCount, unreadUpdateCount);
  }, [unreadUpdateCount]);

  useEffect(() => {
    if (seenNewsIds !== null) {
      saveToLocalStorage(STORAGE_KEYS.seenNewsIds, seenNewsIds);
    }
  }, [seenNewsIds]);

  useEffect(() => {
    if (lastChecked) {
      saveToLocalStorage(STORAGE_KEYS.lastChecked, lastChecked.toISOString());
    }
  }, [lastChecked]);

  useEffect(() => {
    let isCurrentSearch = true;
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      const data = await getGameNews(searchTerm);
      if (isCurrentSearch) {
        setGames(data);
        setLoading(false);
      }
    }, searchTerm.trim() ? 300 : 0);

    return () => {
      isCurrentSearch = false;
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;

    async function checkForGameUpdates() {
      try {
        const updates = await getGamingUpdates();
        if (!isMounted) return;

        const checkedAt = new Date();
        setLastChecked(checkedAt);
        setMonitorStatus("Monitoring the latest gaming news.");

        const previouslySeenIds = seenNewsIdsRef.current;
        const newUpdates = previouslySeenIds
          ? updates.filter((update) => !previouslySeenIds.has(update.id))
          : [];
        const updatedSeenIds = [
          ...(previouslySeenIds || []),
          ...updates.map((update) => update.id),
        ];
        const recentSeenIds = [...new Set(updatedSeenIds)].slice(-500);
        seenNewsIdsRef.current = new Set(recentSeenIds);
        setSeenNewsIds(recentSeenIds);
        setGameUpdates((currentUpdates) => {
          const uniqueUpdates = new Map(
            [...updates, ...currentUpdates].map((update) => [update.id, update])
          );
          return [...uniqueUpdates.values()]
            .sort((first, second) =>
              (second.publishedAt || "").localeCompare(first.publishedAt || "")
            )
            .slice(0, 50);
        });

        if (newUpdates.length === 0) return;

        setUnreadUpdateCount((count) => count + newUpdates.length);

        if (
          "Notification" in window &&
          window.Notification.permission === "granted"
        ) {
          try {
            const extraCount = newUpdates.length - 1;
            new window.Notification("New gaming news", {
              body: `${newUpdates[0].title}${extraCount > 0 ? ` and ${extraCount} more new stor${extraCount === 1 ? "y" : "ies"}` : ""}`,
            });
          } catch (error) {
            console.error("Could not display a browser notification:", error);
            setMonitorStatus("New gaming news was found, but the browser notification could not be displayed.");
          }
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Could not check the gaming news feed:", error);
        setMonitorStatus("Gaming news is unavailable right now. Please try again later.");
      }
    }

    checkForGameUpdates();
    const intervalId = window.setInterval(checkForGameUpdates, UPDATE_CHECK_INTERVAL);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  function toggleSavedArticle(article) {
    setArticles((currentArticles) =>
      currentArticles.some((savedArticle) => savedArticle.id === article.id)
        ? currentArticles.filter((savedArticle) => savedArticle.id !== article.id)
        : [...currentArticles, article]
    );
  }

  function handlePageSelect(page) {
    setActivePage(page);
    if (page === "Updates") setUnreadUpdateCount(0);
    setSelectedFilter(
      ["PlayStation", "Xbox", "Nintendo", "PC Gaming"].includes(page)
        ? page
        : "All Games"
    );
  }

  async function enableBrowserNotifications() {
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }

    try {
      setNotificationPermission(await window.Notification.requestPermission());
    } catch (error) {
      console.error("Could not request browser notification permission:", error);
      setMonitorStatus("Browser notification permission could not be requested.");
    }
  }

  const platformFilter = selectedFilter === "PC Gaming"
    ? "pc"
    : selectedFilter.toLowerCase();
  const filteredGames = selectedFilter === "All Games"
    ? games
    : games.filter((game) =>
        game.platforms.some((platform) =>
          platform.toLowerCase().includes(platformFilter)
        )
      );

  return (
    <div className="app">
      <Header />
      <div className="app-layout">
        <Sidebar
          activePage={activePage}
          onSelect={handlePageSelect}
          updateCount={unreadUpdateCount}
        />
        <main className="main-content">
          {activePage === "Updates" ? (
            <Update
              updates={gameUpdates}
              lastChecked={lastChecked}
              monitorStatus={monitorStatus}
              notificationPermission={notificationPermission}
              onEnableNotifications={enableBrowserNotifications}
            />
          ) : activePage === "Saved Articles" ? (
            <SavedArticles
              articles={articles}
              onRemove={(articleId) =>
                setArticles((currentArticles) =>
                  currentArticles.filter((article) => article.id !== articleId)
                )
              }
              onSave={toggleSavedArticle}
            />
          ) : (
            <>
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              <FilterBar selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
              <div className="news-container">
                <h2>
                  {selectedFilter === "All Games"
                    ? "Latest Gaming Updates"
                    : `${selectedFilter} Games`}
                </h2>
                {loading ? (
                  <p>Loading gaming news...</p>
                ) : filteredGames.length === 0 ? (
                  <p>No games found. Try another search or filter.</p>
                ) : (
                  <div className="news-grid">
                    {filteredGames.map((game) => (
                      <NewsCard
                        key={game.id}
                        article={game}
                        isSaved={articles.some((article) => article.id === game.id)}
                        onSave={toggleSavedArticle}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
