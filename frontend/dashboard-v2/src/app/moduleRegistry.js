import { OverviewPage } from "../modules/overview/OverviewPage.jsx";
import { RemoteAgentPage } from "../modules/remote-agent/RemoteAgentPage.jsx";
import { AdminUsersPage } from "../modules/admin/AdminUsersPage.jsx";
import { AdminLocksPage } from "../modules/admin/AdminLocksPage.jsx";
import { AdminAuditPage } from "../modules/admin/AdminAuditPage.jsx";
import { PlaceholderPage } from "../modules/shared/PlaceholderPage.jsx";

export const moduleRegistry = {
  "system.overview": {
    id: "system.overview",
    sectionTitle: "System",
    moduleTitle: "Übersicht",
    activeTabTitle: "Status",
    migrationStatus: "read_only",
    component: OverviewPage,
    tabs: [
      { id: "status", title: "Status", active: true },
      { id: "migration", title: "Migration", disabled: true },
      { id: "diagnostics", title: "Diagnose", disabled: true }
    ]
  },

  "system.streamPc": {
    id: "system.streamPc",
    sectionTitle: "System",
    moduleTitle: "Stream-PC Verbindung",
    activeTabTitle: "Übersicht",
    migrationStatus: "read_only",
    component: RemoteAgentPage,
    tabs: [
      { id: "overview", title: "Übersicht", active: true },
      { id: "heartbeat", title: "Heartbeat", disabled: true },
      { id: "requests", title: "Requests", disabled: true },
      { id: "audit", title: "Audit", disabled: true }
    ]
  },

  "system.diagnostics": placeholder("System", "Diagnose"),
  "modules.catalog": placeholder("Module", "Modulübersicht"),
  "events.shotAlarm": placeholder("Aktionen", "Shot-Alarm"),
  "events.streamEvents": placeholder("Aktionen", "Stream-Events"),
  "events.hug": placeholder("Aktionen", "Hug-System"),
  "events.giveaway": placeholder("Aktionen", "Giveaways"),
  "loyalty.core": placeholder("Loyalty", "Core"),
  "loyalty.wheel": placeholder("Loyalty", "Glücksrad"),
  "loyalty.transactions": placeholder("Loyalty", "Transaktionen"),
  "media.library": placeholder("Media", "Medienbibliothek"),
  "media.sounds": placeholder("Media", "Sounds"),
  "media.uploads": placeholder("Media", "Uploads"),
  "overlays.overview": placeholder("Overlays", "Übersicht"),
  "overlays.preview": placeholder("Overlays", "Vorschau"),
  "overlays.layouts": placeholder("Overlays", "Layouts"),

  "admin.users": {
    id: "admin.users",
    sectionTitle: "Admin",
    moduleTitle: "Benutzer & Rechte",
    activeTabTitle: "Permissions",
    migrationStatus: "read_only",
    component: AdminUsersPage,
    tabs: [
      { id: "permissions", title: "Permissions", active: true },
      { id: "users", title: "Benutzer", disabled: true },
      { id: "roles", title: "Rollen", disabled: true }
    ]
  },

  "admin.locks": {
    id: "admin.locks",
    sectionTitle: "Admin",
    moduleTitle: "Locks",
    activeTabTitle: "Modell",
    migrationStatus: "read_only",
    component: AdminLocksPage,
    tabs: [
      { id: "model", title: "Modell", active: true },
      { id: "active", title: "Aktive Locks", disabled: true },
      { id: "takeover", title: "Übernahme", disabled: true }
    ]
  },

  "admin.audit": {
    id: "admin.audit",
    sectionTitle: "Admin",
    moduleTitle: "Audit",
    activeTabTitle: "Modell",
    migrationStatus: "read_only",
    component: AdminAuditPage,
    tabs: [
      { id: "model", title: "Modell", active: true },
      { id: "events", title: "Events", disabled: true },
      { id: "routes", title: "API-Routen", disabled: true }
    ]
  },
  "admin.notes": placeholder("Admin", "Admin-Notizen"),
  "admin.connections": placeholder("Admin", "Verbindungen"),
  "admin.details": placeholder("Admin", "Doku / Details"),
  "admin.access": placeholder("Admin", "Rollen & Rechte"),
  "admin.security": placeholder("Admin", "Sicherheit")
};

function placeholder(sectionTitle, moduleTitle) {
  return {
    id: `${sectionTitle}.${moduleTitle}`,
    sectionTitle,
    moduleTitle,
    activeTabTitle: "Geplant",
    migrationStatus: "not_started",
    component: PlaceholderPage,
    tabs: [
      { id: "planned", title: "Geplant", active: true }
    ]
  };
}
