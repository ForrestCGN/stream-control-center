export function Topbar({ activeModule, onToggleSidebar }) {
  return (
    <header className="cgn-topbar" id="topbar">
      <div className="top-left">
        <button className="cgn-icon-button" type="button" title="Navigation ein-/ausklappen" aria-label="Navigation ein-/ausklappen" onClick={onToggleSidebar}>
          <span className="hamburger"><i></i><i></i><i></i></span>
        </button>
        <div className="cgn-breadcrumb"><span>{activeModule.sectionTitle}</span><strong>{activeModule.moduleTitle} <span className="tab-part">• {activeModule.activeTabTitle}</span></strong></div>
      </div>
      <div className="top-search disabled"><span>⌕</span><input type="search" placeholder="Suche später: Module, Sounds, Overlays …" disabled /></div>
      <div className="top-center">
        <span className="cgn-chip cgn-chip--ok">v0.2.10C lokal</span><span className="cgn-chip cgn-chip--info">Port 8080</span><span className="cgn-chip cgn-chip--ok">Read-only</span><span className="cgn-chip cgn-chip--info">Stream-PC Status</span>
      </div>
      <div className="top-right">
        <button className="secondaryButton" type="button" disabled>Neu laden</button>
        <button className="cgn-icon-button cgn-lang" type="button" disabled>DE</button>
        <button className="cgn-icon-button cgn-bell" type="button" disabled>🔒<em>0</em></button>
        <button className="cgn-avatar-button" type="button" disabled><span className="cgn-avatar cgn-avatar-local">F</span><span className="cgn-avatar-copy"><strong>ForrestCGN</strong><small>Lokal</small></span></button>
      </div>
    </header>
  );
}
