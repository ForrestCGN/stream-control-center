import { useMemo, useState } from "react";
import { AppShell } from "./layout/AppShell.jsx";
import { moduleRegistry } from "./app/moduleRegistry.js";
import { getDefaultRoute, navigationSections } from "./app/navigation.js";

export function App() {
  const defaultRoute = useMemo(() => getDefaultRoute(), []);
  const [activeRoute, setActiveRoute] = useState(defaultRoute);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const activeModule = moduleRegistry[activeRoute] ?? moduleRegistry[defaultRoute];
  const ActivePage = activeModule.component;

  return (
    <AppShell
      sections={navigationSections}
      activeRoute={activeRoute}
      activeModule={activeModule}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
      onNavigate={setActiveRoute}
    >
      <ActivePage moduleDefinition={activeModule} />
    </AppShell>
  );
}
