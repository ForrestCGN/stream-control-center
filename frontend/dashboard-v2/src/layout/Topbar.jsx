export function Topbar({ activeModule, onToggleSidebar }) {
  return (
    <header className="cgn-topbar" id="topbar">
      <div className="top-left">
        <button
          className="cgn-icon-button"
          type="button"
          title="Navigation ein-/ausklappen"
          aria-label="Navigation ein-/ausklappen"
          onClick={onToggleSidebar}
        >
          <span className="hamburger"><i></i><i></i><i></i></span>
        </button>

        <div className="cgn-breadcrumb">
          <span>{activeModule.sectionTitle}</span>
          <strong>{activeModule.moduleTitle} <em>• {activeModule.activeTabTitle}</em></strong>
        </div>
      </div>

      <div className="top-search">
        <span>⌕</span>
        <input type="search" placeholder="Suchen: Module, Media, Texte, Logs …" />
      </div>

      <div className="top-center">
        <span className="cgn-chip cgn-chip--ok">Agent</span>
        <span className="cgn-chip cgn-chip--ok">OBS</span>
        <span className="cgn-chip cgn-chip--info">Sound</span>
        <span className="cgn-chip cgn-chip--warn">0 Locks</span>
      </div>

      <div className="top-right">
        <button className="cgn-icon-button cgn-lang" type="button">DE</button>
        <button className="cgn-icon-button cgn-bell" type="button">🔔<em>3</em></button>
        <button className="cgn-avatar-button" type="button">
          <span className="cgn-avatar">F</span>
          <span className="cgn-avatar-copy">
            <strong>ForrestCGN</strong>
            <small>Owner</small>
          </span>
        </button>
      </div>
    </header>
  );
}
