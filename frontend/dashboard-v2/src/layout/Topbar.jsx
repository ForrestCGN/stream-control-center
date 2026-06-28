export function Topbar({ activeModule, onToggleSidebar }) {
  const sectionTitle = activeModule?.sectionTitle || "System";
  const moduleTitle = activeModule?.moduleTitle || "Übersicht";
  const activeTabTitle = activeModule?.activeTabTitle || "Status";

  return (
    <header className="cgn-topbar" id="topbar">
      <div className="top-left">
        <button className="cgn-icon-button" type="button" title="Navigation ein-/ausklappen" aria-label="Navigation ein-/ausklappen" onClick={onToggleSidebar}>
          <span className="hamburger"><i></i><i></i><i></i></span>
        </button>
        <div className="cgn-breadcrumb">
          <span>{sectionTitle}</span>
          <strong>{moduleTitle}<span className="tab-part">{activeTabTitle}</span></strong>
        </div>
      </div>

      <div className="top-search disabled" aria-label="Suche später verfügbar">
        <span>⌕</span>
        <input type="search" placeholder="Suche später: Module, User, Logs …" disabled />
      </div>

      <div className="top-center" aria-label="Lokale Status-Chips">
        <span className="cgn-chip cgn-chip--ok">v0.2.10E lokal</span>
        <span className="cgn-chip cgn-chip--info">Lokalmodus</span>
        <span className="cgn-chip cgn-chip--ok">Read-only</span>
        <span className="cgn-chip cgn-chip--ok">Stream-PC lokal</span>
      </div>

      <div className="top-right">
        <button className="secondaryButton" type="button" disabled>Neu laden</button>
        <button className="cgn-icon-button cgn-lang" type="button" disabled>DE</button>
        <button className="cgn-icon-button cgn-bell" type="button" title="Read-only gesperrt" aria-label="Read-only gesperrt" disabled>🔒<em>0</em></button>
        <button className="cgn-avatar-button" type="button" disabled title="Lokales Dashboard v2">
          <span className="cgn-avatar"><span>F</span></span>
          <span className="cgn-avatar-copy"><strong>ForrestCGN</strong><small>Aktualisiert: lokal</small></span>
        </button>
      </div>
    </header>
  );
}
