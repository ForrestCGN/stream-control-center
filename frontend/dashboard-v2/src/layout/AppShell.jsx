import { Sidebar } from "./Sidebar.jsx";
import { Topbar } from "./Topbar.jsx";
import { ModuleTabs } from "./ModuleTabs.jsx";

export function AppShell({
  sections,
  activeRoute,
  activeModule,
  isSidebarCollapsed,
  onToggleSidebar,
  onNavigate,
  children
}) {
  return (
    <>
      <div className="cgn-galaxy" aria-hidden="true">
        <div className="bg-wash bg-wash-a"></div>
        <div className="bg-wash bg-wash-b"></div>
        <div className="bg-core"></div>
        <div className="stars"></div>
        <div className="dot-grid"></div>
      </div>

      <Topbar
        activeModule={activeModule}
        onToggleSidebar={onToggleSidebar}
      />

      <div className={`cgn-layout ${isSidebarCollapsed ? "is-nav-collapsed" : ""}`}>
        <Sidebar
          sections={sections}
          activeRoute={activeRoute}
          onNavigate={onNavigate}
        />

        <main className="cgn-main">
          <section className="cgn-view">
            <div className="view-head">
              <div>
                <span className="view-kicker">{activeModule.sectionTitle}</span>
                <h1>{activeModule.moduleTitle}</h1>
                <p>
                  Der neue lokale Einstieg wird parallel zum bestehenden Dashboard vorbereitet.
                  Diese Ansicht zeigt ausschließlich freigegebene Read-only-Inhalte.
                </p>
              </div>

              <span className="cgn-chip cgn-chip--info">
                Status: {activeModule.migrationStatus === "read_only" ? "read-only" : "geplant"}
              </span>
            </div>

            <ModuleTabs tabs={activeModule.tabs} />
            {children}
          </section>
        </main>
      </div>
    </>
  );
}
