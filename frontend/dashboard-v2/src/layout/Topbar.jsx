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

      <div className="top-right">
        <span className="cgn-chip">Lokal · Port 8080</span>
        <span className="cgn-chip cgn-chip--info">Read-only</span>
      </div>
    </header>
  );
}
