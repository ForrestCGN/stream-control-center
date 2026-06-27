import { useMemo, useState } from "react";

export function Sidebar({ sections, activeRoute, onNavigate }) {
  const activeSectionId = useMemo(() => sections.find((item) => item.modules.some((module) => module.route === activeRoute))?.id ?? sections[0]?.id, [activeRoute, sections]);
  const [openSectionId, setOpenSectionId] = useState(activeSectionId);

  return (
    <aside className="cgn-sidebar" aria-label="Dashboard Navigation">
      <div className="sidebar-head"><strong>Navigation</strong><span>Remote Modboard</span></div>
      <nav className="cgn-nav">
        {sections.map((section) => {
          const isOpen = openSectionId === section.id;
          return <div className="nav-block" key={section.id}>
            <button className={`nav-group ${isOpen ? "is-open" : ""}`} type="button" onClick={() => setOpenSectionId((current) => current === section.id ? "" : section.id)} aria-expanded={isOpen}>
              <span>{section.icon}</span><b>{section.title}</b><i>⌄</i>
            </button>
            <div className={`nav-sub ${isOpen ? "is-open" : ""}`}>
              {section.modules.map((module) => <button className={`nav-link ${module.route === activeRoute ? "is-active" : ""}`} key={module.route} type="button" disabled={Boolean(module.disabled)} onClick={() => !module.disabled && onNavigate(module.route)}>{module.title}</button>)}
            </div>
          </div>;
        })}
      </nav>
      <div className="sidebar-foot"><span>ForrestCGN</span><strong>Modboard</strong></div>
    </aside>
  );
}
