# FILES

Stand: RDAP1 / Remote Dashboard Agent Plan
Datum: 2026-06-22

## In diesem ZIP enthalten

- `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
- `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Art des Steps

Reiner Doku-/Planungsstep.

Es werden keine Runtime-Dateien geändert.

## Wichtige Runtime-Dateien, die durch dieses Doku-ZIP NICHT geändert werden

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

## Neue Plan-Dateien

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

Für RDAP1 nicht nötig.

Grund:

- nur Markdown-Dokumentation
- keine Backend-Datei
- keine Dashboard-JS/CSS-Datei
- keine Overlay-HTML-Datei
- keine Config
- keine DB
