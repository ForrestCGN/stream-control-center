import { OverviewPage } from "../modules/overview/OverviewPage.jsx";
import { RemoteAgentPage } from "../modules/remote-agent/RemoteAgentPage.jsx";
import { PlaceholderPage } from "../modules/shared/PlaceholderPage.jsx";

export const moduleRegistry = {
  "live.overview": {
    id: "live.overview",
    sectionTitle: "Live",
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

  "live.remoteAgent": {
    id: "live.remoteAgent",
    sectionTitle: "Live",
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

  "live.analytics": placeholder("Live", "Statistiken"),
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
  "admin.users": placeholder("Admin", "Benutzer & Rechte"),
  "admin.locks": placeholder("Admin", "Locks"),
  "admin.audit": placeholder("Admin", "Audit")
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
