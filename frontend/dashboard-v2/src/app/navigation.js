export const navigationSections = [
  {
    id: "live",
    title: "Live",
    icon: "◆",
    modules: [
      {
        route: "live.overview",
        title: "Übersicht",
        subtitle: "Status und Einstieg"
      },
      {
        route: "live.analytics",
        title: "Statistiken",
        subtitle: "später",
        disabled: true
      },
      {
        route: "live.remoteAgent",
        title: "Remote Agent",
        subtitle: "geplant / read-only"
      }
    ]
  },
  {
    id: "actions",
    title: "Aktionen",
    icon: "✦",
    modules: [
      {
        route: "events.shotAlarm",
        title: "Shot-Alarm",
        subtitle: "später",
        disabled: true
      },
      {
        route: "events.streamEvents",
        title: "Stream-Events",
        subtitle: "später",
        disabled: true
      },
      {
        route: "events.hug",
        title: "Hug-System",
        subtitle: "später",
        disabled: true
      },
      {
        route: "events.giveaway",
        title: "Giveaways",
        subtitle: "später",
        disabled: true
      }
    ]
  },
  {
    id: "loyalty",
    title: "Loyalty",
    icon: "◇",
    modules: [
      {
        route: "loyalty.core",
        title: "Core",
        subtitle: "später",
        disabled: true
      },
      {
        route: "loyalty.wheel",
        title: "Glücksrad",
        subtitle: "später",
        disabled: true
      },
      {
        route: "loyalty.transactions",
        title: "Transaktionen",
        subtitle: "später",
        disabled: true
      }
    ]
  },
  {
    id: "media",
    title: "Media",
    icon: "◈",
    modules: [
      {
        route: "media.library",
        title: "Medienbibliothek",
        subtitle: "später",
        disabled: true
      },
      {
        route: "media.sounds",
        title: "Sounds",
        subtitle: "später",
        disabled: true
      },
      {
        route: "media.uploads",
        title: "Uploads",
        subtitle: "später",
        disabled: true
      }
    ]
  },
  {
    id: "overlays",
    title: "Overlays",
    icon: "▣",
    modules: [
      {
        route: "overlays.overview",
        title: "Übersicht",
        subtitle: "später",
        disabled: true
      },
      {
        route: "overlays.preview",
        title: "Vorschau",
        subtitle: "später",
        disabled: true
      },
      {
        route: "overlays.layouts",
        title: "Layouts",
        subtitle: "später",
        disabled: true
      }
    ]
  },
  {
    id: "admin",
    title: "Admin",
    icon: "⚙",
    modules: [
      {
        route: "admin.users",
        title: "Benutzer & Rechte",
        subtitle: "später",
        disabled: true
      },
      {
        route: "admin.locks",
        title: "Locks",
        subtitle: "später",
        disabled: true
      },
      {
        route: "admin.audit",
        title: "Audit",
        subtitle: "später",
        disabled: true
      }
    ]
  }
];

export function getDefaultRoute() {
  return "live.overview";
}
