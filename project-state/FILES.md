# FILES

Stand: RDAP2.DOC1 / Remote-Dashboard-Agent Architekturentscheidungen dokumentiert  
Datum: 2026-06-22

## Art des aktuellen Doku-Stands

Reiner Doku-/Planungsstand.

Es werden keine Runtime-Dateien geändert.

## Neu / aktualisiert

- `docs/current/REMOTE_DASHBOARD_AGENT_RDAP2_DECISIONS.md`
- `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Neue RDAP2-Plan-Datei

### `docs/current/REMOTE_DASHBOARD_AGENT_RDAP2_DECISIONS.md`

Enthält:

- finalen RDAP2-Entscheidungsstand
- Subdomain `modboard.forrestcgn.de`
- Hetzner / ISPConfig / nginx / Let's Encrypt
- Node-App intern auf `127.0.0.1:3000`
- separater Stream-PC-Agent-Prozess
- lokales Backend auf `127.0.0.1:8080`
- Offline-Regel
- Datenhoheit Webserver / Stream-PC / NAS
- NAS/MariaDB-Rolle
- Remote-Actions v1
- Login-/Rechte-Regel
- Edit-Session-/Lock-System
- Resource-Key- und ID-Konzept
- nächste Schritte RDAP3/RDAP4/DASHUI2

## Aktualisierte RDAP1-Plan-Datei

### `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`

Wurde auf RDAP2-Verweis aktualisiert.

## Wichtige Runtime-Dateien, die durch diesen Doku-Stand NICHT geändert werden

- `server.js`
- `backend/modules/*`
- `backend/modules/helpers/*`
- `htdocs/dashboard/*`
- `htdocs/overlays/*`
- `config/*`
- `data/*`
- `D:\Streaming\stramAssets\data\sqlite\app.sqlite`

## Weiterhin relevante Plan-Dateien

- `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md`
- `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md`

## Relevante lokale Pfade

- Repo: `D:\Git\stream-control-center`
- Live-Ziel: `D:\Streaming\stramAssets`
- Produktive DB: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`
- lokales Backend: `http://127.0.0.1:8080`
- lokales Dashboard: `http://127.0.0.1:8080/dashboard`

## Geplante Remote-Ziele

- Remote-Modboard: `https://modboard.forrestcgn.de`
- Hetzner Node intern: bevorzugt `127.0.0.1:3000`
- öffentlich nur HTTPS/WSS

## Node-Neustart

Für RDAP2.DOC1 nicht nötig.

Grund:

- nur Markdown-Dokumentation
- keine Backend-Datei
- keine Dashboard-JS/CSS-Datei
- keine Overlay-HTML-Datei
- keine Config
- keine DB
- kein Agent-Code
