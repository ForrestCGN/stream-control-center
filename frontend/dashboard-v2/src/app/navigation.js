export const navigationSections = [
  {
    id: "system",
    title: "System",
    icon: "◆",
    modules: [
      {
        route: "system.overview",
        title: "Übersicht",
        subtitle: "Lokaler Einstieg · read-only"
      },
      {
        route: "system.diagnostics",
        title: "Diagnose",
        subtitle: "später",
        disabled: true
      },
      {
        route: "system.streamPc",
        title: "Stream-PC",
        subtitle: "später",
        disabled: true
      }
    ]
  },
  {
    id: "modules",
    title: "Module",
    icon: "◇",
    modules: [
      {
        route: "modules.catalog",
        title: "Modulübersicht",
        subtitle: "später",
        disabled: true
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
    icon: "◉",
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
        title: "Benutzerverwaltung",
        subtitle: "später",
        disabled: true
      },
      {
        route: "admin.notes",
        title: "Admin-Notizen",
        subtitle: "später",
        disabled: true
      },
      {
        route: "admin.connections",
        title: "Verbindungen",
        subtitle: "später",
        disabled: true
      },
      {
        route: "admin.details",
        title: "Doku / Details",
        subtitle: "später",
        disabled: true
      },
      {
        route: "admin.access",
        title: "Rollen & Rechte",
        subtitle: "später",
        disabled: true
      },
      {
        route: "admin.security",
        title: "Sicherheit",
        subtitle: "später",
        disabled: true
      }
    ]
  }
];

export function getDefaultRoute() {
  return "system.overview";
}
