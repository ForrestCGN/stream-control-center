import { OverviewPage } from "../modules/overview/OverviewPage.jsx";
import { StreamPcStatusPage } from "../modules/stream-pc/StreamPcStatusPage.jsx";
import { PlaceholderPage } from "../modules/shared/PlaceholderPage.jsx";

export const moduleRegistry = {
  "system.overview": {
    id: "system.overview",
    sectionTitle: "System",
    moduleTitle: "Übersicht",
    activeTabTitle: "Status",
    migrationStatus: "read_only",
    component: OverviewPage,
    tabs: []
  },
  "system.streamPc": {
    id: "system.streamPc",
    sectionTitle: "System",
    moduleTitle: "Stream-PC",
    activeTabTitle: "read-only",
    migrationStatus: "read_only",
    component: StreamPcStatusPage,
    tabs: []
  },
  "system.diagnostics": placeholder("System", "Diagnose"),
  "modules.catalog": placeholder("Module", "Modulübersicht"),
  "admin.users": placeholder("Admin", "Benutzerverwaltung"),
  "admin.notes": placeholder("Admin", "Admin-Notizen"),
  "admin.connections": placeholder("Admin", "Verbindungen")
};

function placeholder(sectionTitle, moduleTitle) {
  return {
    id: `${sectionTitle}.${moduleTitle}`,
    sectionTitle,
    moduleTitle,
    activeTabTitle: "Geplant",
    migrationStatus: "not_started",
    component: PlaceholderPage,
    tabs: []
  };
}
