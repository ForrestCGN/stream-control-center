export const navigationSections = [
  {
    id: "system",
    title: "System",
    icon: "◆",
    modules: [
      { route: "system.overview", title: "Übersicht", subtitle: "Status" },
      { route: "system.streamPc", title: "Stream-PC", subtitle: "read-only" },
      { route: "system.diagnostics", title: "Diagnose", subtitle: "später", disabled: true }
    ]
  },
  {
    id: "modules",
    title: "Module",
    icon: "◇",
    modules: [
      { route: "modules.catalog", title: "Modulübersicht", subtitle: "später", disabled: true }
    ]
  },
  {
    id: "admin",
    title: "Admin",
    icon: "⚙",
    modules: [
      { route: "admin.users", title: "Benutzerverwaltung", subtitle: "später", disabled: true },
      { route: "admin.notes", title: "Admin-Notizen", subtitle: "später", disabled: true },
      { route: "admin.connections", title: "Verbindungen", subtitle: "später", disabled: true }
    ]
  }
];

export function getDefaultRoute() {
  return "system.overview";
}
