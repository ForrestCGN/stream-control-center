import { useEffect } from "react";
import { Sidebar } from "./Sidebar.jsx";
import { Topbar } from "./Topbar.jsx";
import { ModuleTabs } from "./ModuleTabs.jsx";

export function AppShell({ sections, activeRoute, activeModule, isSidebarCollapsed, onToggleSidebar, onNavigate, children }) {
  useEffect(() => {
    function updateScrolledState() {
      document.body.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolledState);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-collapsed", isSidebarCollapsed);
    return () => document.body.classList.remove("nav-collapsed");
  }, [isSidebarCollapsed]);

  return (
    <>
      <div className="cgn-galaxy" aria-hidden="true">
        <div className="bg-wash bg-wash-a"></div><div className="bg-wash bg-wash-b"></div><div className="bg-core"></div><div className="stars"></div><div className="dot-grid"></div>
      </div>
      <Topbar activeModule={activeModule} onToggleSidebar={onToggleSidebar} />
      <div className="cgn-layout">
        <Sidebar sections={sections} activeRoute={activeRoute} onNavigate={onNavigate} />
        <div className="cgn-scrim"></div>
        <main className="cgn-content">
          <ModuleTabs tabs={activeModule.tabs} />
          {children}
        </main>
      </div>
    </>
  );
}
