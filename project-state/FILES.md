# FILES

Stand: RDAP1 + DASHUI1 / Dashboard-v2 Designrichtung dokumentiert
Datum: 2026-06-22

## Art des aktuellen Doku-Stands

Reiner Doku-/Planungsstand.

Es werden keine Runtime-Dateien geändert.

## Neu / aktualisiert

- `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
- `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md`
- `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Neue Design-/Frontend-Plan-Datei

### `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md`

Enthält:

- bestätigte Dashboard-v2 Designrichtung
- CGN-Dark-/Neon-/Galaxy-Stil
- Vision-UI-artige Designinspiration ohne Codeübernahme
- Topbar-Regeln
- Sidebar-Regeln
- Modul-Navi-/Tab-Regeln
- einheitlichen Seitenaufbau für Streamer-/Mod-Seiten
- Admin-Abgrenzung für technische Bereiche
- React/Vite als bevorzugte Frontend-Richtung
- CGN-Komponentensystem
- Modul-Registry-Idee
- wichtige Komponentenliste
- relevante Design-Teststände v8 bis v13

## Wichtigster Design-Teststand aus dem Chat

- `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip`

Dieser ZIP-Stand wurde im Chat erzeugt, aber nicht als Runtime-Datei ins Repo übernommen.

## Bestätigte UI-Regeln aus v13

- Sidebar = Hauptkategorie → Modul
- keine dritte Sidebar-Ebene
- Modul-Navi/Tabs innerhalb der Modulseite
- Topbar zeigt `Hauptbereich` und `Modul • aktiver Tab`
- aktiver Tab steht inline hinter dem Modulnamen
- Topbar fixed mit Scroll-Rand-Effekt
- Sidebar fixed auf Desktop
- Sidebar Drawer unter ca. 1180px
- normale Seiten bleiben streamer-/modfreundlich
- Admin bündelt Technik, tiefe Configs, Diagnose, Rechte und Audit

## Wichtige Runtime-Dateien, die durch diesen Doku-Stand NICHT geändert werden

- `server.js`
- `backend/modules/*`
- `backend/modules/helpers/*`
- `htdocs/dashboard/*`
- `htdocs/overlays/*`
- `config/*`
- `data/*`
- `D:\Streaming\stramAssets\data\sqlite\app.sqlite`

## Wichtige vorhandene Runtime-Dateien aus dem letzten HT4.x-Stand

- `htdocs/overlays/central_event_overlay.html`
- `htdocs/overlays/shared/overlay_bus_client.js`
- `backend/modules/hypetrain.js`
- `backend/modules/communication_bus.js`
- `backend/modules/helpers/helper_communication.js`
- `backend/modules/sound_system.js`
- `htdocs/dashboard/modules/hypetrain.js`
- `htdocs/dashboard/modules/hypetrain.css`

## Plan-Dateien

### `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`

Enthält:

- Ziel
- Architektur
- Webserver-Aufgaben
- Stream-PC-Agent-Aufgaben
- WSS/WebSocket-Verbindung
- Agent-Authentifizierung
- erste erlaubte Agent-Actions
- Statusmeldungen
- Reconnect/Offline-Verhalten
- Sicherheitsregeln
- Audit-Log
- offene Fragen

### `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md`

Enthält:

- Owner
- Admin
- Lead-Mod
- Mod
- Readonly
- Sound-Profi
- mögliche Media-Manager-Rolle
- Twitch-Rollen-Mapping
- einzelne Permissions
- Modulfreigaben
- Schutzstufen
- Regeln für Texte/Configs/Media/Commands/Kanalpunkte/Overlays/Logs/Admin/Locks

## Relevante lokale Pfade

- Repo: `D:\Git\stream-control-center`
- Live-Ziel: `D:\Streaming\stramAssets`
- Produktive DB: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`

## Relevante URLs

Aktueller lokaler Stand:

- `http://127.0.0.1:8080`
- `http://127.0.0.1:8080/dashboard`
- `http://127.0.0.1:8080/overlays/central_event_overlay.html`
- `http://127.0.0.1:8080/api/communication/status`

## Node-Neustart

Für DASHUI1 nicht nötig.

Grund:

- nur Markdown-Dokumentation
- keine Backend-Datei
- keine Dashboard-JS/CSS-Datei
- keine Overlay-HTML-Datei
- keine Config
- keine DB
