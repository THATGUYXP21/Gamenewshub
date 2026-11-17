function Update({
  updates,
  lastChecked,
  monitorStatus,
  notificationPermission,
  onEnableNotifications,
}) {
  return (
    <section className="updates-section">
      <div className="updates-heading">
        <div>
          <h1>Latest Gaming News</h1>
          <p className="section-description">
            New stories from IGN about games across platforms. The feed refreshes every 15 minutes while the app is open.
          </p>
        </div>
        {notificationPermission === "default" && (
          <button
            className="notification-button"
            type="button"
            onClick={onEnableNotifications}
          >
            Enable browser notifications
          </button>
        )}
      </div>

      <div className="updates-status" role="status">
        <span>{monitorStatus}</span>
        <small>
          {lastChecked
            ? `Last checked ${lastChecked.toLocaleTimeString()}`
            : "Waiting for the first check"}
        </small>
      </div>

      {notificationPermission === "granted" && (
        <p className="notification-note">Browser notifications are enabled.</p>
      )}
      {notificationPermission === "denied" && (
        <p className="notification-note">
          Browser notifications are blocked. Allow them in your browser settings to receive system alerts.
        </p>
      )}
      {notificationPermission === "unsupported" && (
        <p className="notification-note">
          This browser does not support system notifications. New stories will appear here.
        </p>
      )}

      {updates.length === 0 ? (
        <div className="empty-state">
          <h2>No gaming news available</h2>
          <p>New headlines will appear here when the news feed is available.</p>
        </div>
      ) : (
        <div className="updates-list">
          {updates.map((update) => (
            <article className="update-card" key={update.id}>
              <div className="update-card-heading">
                <h2>{update.title}</h2>
                {update.publishedAt && (
                  <time dateTime={update.publishedAt}>
                    {new Date(update.publishedAt).toLocaleString()}
                  </time>
                )}
              </div>
              {update.summary && <p className="update-summary">{update.summary}</p>}
              <div className="update-card-footer">
                <span>{update.source}</span>
                <a href={update.url} target="_blank" rel="noopener noreferrer">
                  Read story
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Update;
