# Dashboard v2 Design- und Frontend-Plan

Stand: 2026-06-23  
Status: aktualisiert durch DASHUI2.DOC1 / Frontend-Tech-Entscheidung konkretisiert

## Zweck dieser Datei

Diese Datei haelt die bestaetigte Richtung fuer Dashboard-v2 fest, damit spaetere Chats und Umsetzungen nicht wieder bei null anfangen.

Wichtig: Dieser Stand ist Design-/Frontend-Planung, keine Runtime-Umsetzung.

Nicht geaendert durch diesen Plan:

- kein Backend-Code
- kein bestehendes Dashboard
- keine produktive DB
- keine Config
- keine OBS-Quelle
- kein Remote-Agent-Code
- kein React-/Vite-Code

## Bestaetigte Designbasis

Als aktuelle Designrichtung gilt der Stand aus:

```text
DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip
```

Dieser Teststand ist nur ein Mockup/Prototyp, aber die dort gezeigten Regeln gelten als Designbasis.

## Grundoptik

Dashboard-v2 bekommt einen eigenen CGN-Dark-/Neon-/Galaxy-Stil.

Festgelegt:

- dunkler blau/lila Grund
- ruhiger Vision-UI-artiger Galaxy-/Nebula-Hintergrund
- dezente Dot-/Star-Struktur
- keine unruhigen oder zu hellen Hintergruende hinter Text
- Glassmorphism-Karten mit abgerundeten Ecken
- Neon-Lila/Cyan/Blau als Akzentfarben
- hoher Kontrast und gute Lesbarkeit
- keine direkte Kopie von Creative-Tim/Vision-UI-Code oder Templates

Creative Tim / Vision UI dient nur als Inspiration fuer Dashboard-Komponenten, Kartenaufbau, Tabellenstil, Timeline/Progress/Chips, Glass-/Dark-Look und grobe UI-Patterns. Nicht uebernommen werden fertiger Creative-Tim-Code, deren React-/MUI-/Chakra-Struktur, Business-Inhalte und Template-/Lizenzstruktur.

## Topbar

Die Topbar ist dauerhaft oben fixiert.

Die Standortanzeige zeigt:

```text
Hauptbereich
Modul • aktiver Tab
```

Beispiele:

```text
Live
Remote Agent • Übersicht
```

```text
Aktionen
Shot-Alarm • Statistik
```

Der aktive Tab steht in derselben Zeile direkt hinter dem Modulnamen, getrennt mit `•`, nicht darunter.

## Navigation

Die linke Sidebar ist die Hauptnavigation.

Feste Regel:

```text
Sidebar = Hauptkategorie -> Modul
Modul-Navi = Unterbereiche innerhalb der Seite
Admin = Technik, Tiefe, Diagnose, gefährliche Aktionen
```

Keine dritte Ebene in der Sidebar.

## Sidebar-Verhalten

Festgelegt:

- Accordion-Verhalten wie Material-Admin-Pro-artige Navigation
- immer nur ein Hauptbereich offen
- keine Einstellung dafür nötig
- Sidebar Desktop/HD links sichtbar
- Sidebar per Menübutton einklappbar
- unter ca. 1180px als Drawer
- Sidebar ist auf Desktop fixed, nicht sticky

## Modul-Navi / Tabs

Innerhalb einer Modulseite gibt es direkt unter dem PageHeader eine Modul-Navi.

Beispiele:

```text
Shot-Alarm: Übersicht | Verlauf | Statistik | Texte | Einstellungen
Stream-Events: Übersicht | Events | Teilnehmer | Runden | Finale | Logs
Media: Bibliothek | Sounds | Videos | Bilder | Uploads | Zuordnungen
Loyalty: Übersicht | Transaktionen | Ranking | Giveaways | Glücksrad | Texte
Admin: Übersicht | Benutzer | Rollen | Texte | Configs | Diagnose | Audit
```

Beim Klick auf einen Tab muss die Topbar den aktiven Tab aktualisieren.

## Einheitlicher Seitenaufbau

Normale Streamer-/Mod-Seiten sollen fast alle gleich aufgebaut sein.

Standardmuster:

1. PageHeader
2. Modul-Navi / Tabs
3. Status-/KPI-Zeile
4. Hauptkarte
5. Verlauf / letzte Ereignisse
6. einfache Optionen nur wenn alltagstauglich

Normale Seiten zeigen keine API-Routen, JSON-Rohdaten, DB-Details, Tokens oder Debug-Flags. Diese Dinge gehoeren in Admin.

## Admin

Admin enthaelt Userverwaltung, Rollen/Rechte, Locks, Audit-Log, Diagnose/Testbereich, technische Configs, Textvarianten-Editor und geschuetzte Secret-/Token-Bereiche ohne Klartextanzeige.

## Erweiterbarkeit / Umstrukturierbarkeit

Dashboard-v2 muss einfach erweiterbar und spaeter umstrukturierbar bleiben.

Feste Architekturregel:

```text
Navigation, Module, Rechte, Texte, Configs und Seitenstruktur dürfen nicht hart überall verteilt sein.
```

## Frontend-Technik

Bestaetigte bevorzugte Richtung:

```text
React + Vite
```

Details stehen in:

```text
docs/current/DASHBOARD_V2_FRONTEND_TECH_DECISION.md
```

Feste Regeln:

- kein Creative-Tim-Template kopieren
- keine direkte Vision-UI-Codebasis übernehmen
- keine MUI-/Chakra-Abhängigkeit erzwingen
- eigenes CGN-Designsystem bauen
- API/WebSocket/Auth/Locks getrennt von UI halten
- keine Secrets ins Frontend
- keine echten Sicherheitsentscheidungen im Frontend

## Vorgeschlagene Frontend-Struktur

Zielstruktur fuer spaetere Umsetzung:

```text
frontend/dashboard-v2/
  src/
    app/
      App.jsx
      router.jsx
      moduleRegistry.js
      navigationRegistry.js
    layout/
      AppShell.jsx
      Topbar.jsx
      Sidebar.jsx
      PageHeader.jsx
      ModuleTabs.jsx
    components/
      CgnCard.jsx
      CgnButton.jsx
      CgnChip.jsx
      CgnTable.jsx
      CgnPagination.jsx
      CgnTimeline.jsx
      CgnSwitch.jsx
      CgnModal.jsx
      CgnToast.jsx
      CgnAvatar.jsx
      CgnProgress.jsx
    modules/
      overview/
      agent/
      media/
      overlays/
      loyalty/
      events/
      shotAlarm/
      admin/
    services/
      apiClient.js
      wsClient.js
      authClient.js
      permissionClient.js
      lockClient.js
      agentClient.js
    styles/
      tokens.css
      theme.css
      layout.css
      components.css
```

Build-Ziel spaeter:

```text
htdocs/dashboard-v2/
```

Der genaue Build-/Deploy-Workflow muss separat geplant werden.

## Moduldefinitionen / Registry-Idee

Module sollen sich spaeter ueber Definitionen registrieren. Wenn ein Modul spaeter in eine andere Hauptkategorie soll, darf nicht die halbe Sidebar umgebaut werden muessen.

## Wichtige Komponentenideen

Das eigene CGN-Designsystem soll mindestens diese Bausteine bekommen:

- `CgnCard`
- `CgnStatCard`
- `CgnChartCard`
- `CgnButton`
- `CgnChip`
- `CgnTable`
- `CgnPagination`
- `CgnTimeline`
- `CgnSwitch`
- `CgnModal`
- `CgnConfirmDialog`
- `CgnToast`
- `CgnAvatar`
- `CgnProgress`
- `CgnModuleTabs`
- `CgnPageHeader`
- `CgnLockBanner`

## Design-Teststaende aus dem Chat

Die im Chat erzeugten ZIPs waren isolierte Design-Tests und gehoeren nicht automatisch ins Repo.

Wichtigster bestaetigter Stand:

```text
DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip
```

## Weiteres Vorgehen

Prioritaet bleibt:

1. sichere Webserver-Stream-PC-Agent-Architektur
2. Rollen/Rechte/Locks
3. React/Vite-Frontend-Entscheidung sauber dokumentieren
4. kleiner technischer Dashboard-v2-Prototyp
5. erst danach echte Modulmigration

Keine produktive Dashboard-v2-Umsetzung ohne separaten Step und `go`.
