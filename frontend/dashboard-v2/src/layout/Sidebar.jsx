import { useMemo, useState } from "react";

export function Sidebar({ sections, activeRoute, onNavigate }) {
  const activeSectionId = useMemo(() => {
    const section = sections.find((item) =>
      item.modules.some((module) => module.route === activeRoute)
    );

    return section?.id ?? sections[0]?.id;
  }, [activeRoute, sections]);

  const [openSectionId, setOpenSectionId] = useState(activeSectionId);

  function handleGroupClick(sectionId) {
    setOpenSectionId((current) => current === sectionId ? "" : sectionId);
  }

  return (
    <aside className="cgn-sidebar" aria-label="Dashboard Navigation">
      <div className="sidebar-head">
        <strong>Navigation</strong>
        <span>Module werden schrittweise übernommen</span>
      </div>

      <nav className="cgn-nav">
        {sections.map((section) => {
          const isOpen = openSectionId === section.id;

          return (
            <div className="nav-block" key={section.id}>
              <button
                className={`nav-group ${isOpen ? "is-open" : ""}`}
                type="button"
                onClick={() => handleGroupClick(section.id)}
                aria-expanded={isOpen}
              >
                <span>{section.icon}</span>
                <b>{section.title}</b>
                <i>⌄</i>
              </button>

              <div className={`nav-sub ${isOpen ? "is-open" : ""}`}>
                {section.modules.map((module) => {
                  const isActive = module.route === activeRoute;

                  return (
                    <button
                      className={`nav-link ${isActive ? "is-active" : ""}`}
                      key={module.route}
                      type="button"
                      disabled={Boolean(module.disabled)}
                      onClick={() => !module.disabled && onNavigate(module.route)}
                    >
                      <span>{module.title}</span>
                      {module.subtitle ? <em>{module.subtitle}</em> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
