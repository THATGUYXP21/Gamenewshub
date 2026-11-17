function Header() {
  return (
    <header className="app-header">
      <div className="app-header-content">
        <span className="logo-icon">VG</span>
        <div className="header-title">
          <h1>DiscoveryVG</h1>
          <h2>GameNews <span>Hub</span></h2>
        </div>
      </div>

      <div className="header-right">
        <span className="live-status">
          <span className="live-dot"></span>
          GAMING NEWS
        </span>
        <div className="profile-icon">VG</div>
      </div>
    </header>
  );
}

export default Header;