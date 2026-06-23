# FILES

Stand: RDAP2.WEB1 / Webserver-Grundlage für Remote-Modboard geprüft  
Datum: 2026-06-23

## Art des aktuellen Doku-Stands

Infrastruktur-/Doku-/Planungsstand.

Es wurden keine `stream-control-center`-Runtime-Dateien geändert.

## Neu / aktualisiert

- `docs/current/REMOTE_DASHBOARD_WEB_SERVER_STATUS_2026-06-23.md`
- `docs/current/START_HERE_FOR_NEW_CHAT.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Neue Webserver-Status-Datei

### `docs/current/REMOTE_DASHBOARD_WEB_SERVER_STATUS_2026-06-23.md`

Enthält:

- geprüfte Webserver-Basis
- neue Remote-Modboard-Subdomain `mods.forrestcgn.de`
- DNS-/HTTPS-/IPv4-/IPv6-Status
- nginx-/ISPConfig-/Let's-Encrypt-Status
- Node.js/npm-Status
- apt-/Rspamd-Key-Fix
- Port-/Firewall-Hinweise
- klare Abgrenzung: keine Projekt-Runtime-Umsetzung
- nächsten Schritt RDAP3

## Weiterhin relevante RDAP2-Plan-Dateien

### `docs/current/REMOTE_DASHBOARD_AGENT_RDAP2_DECISIONS.md`

Enthält:

- finalen RDAP2-Entscheidungsstand
- Webserver / ISPConfig / nginx / Let's Encrypt
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

Wichtig: Für die aktuelle Remote-Zieladresse gilt nach RDAP2.WEB1 `mods.forrestcgn.de`.

### `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`

Grobe Agent-Architekturplanung mit RDAP2-Verweis.

Wichtig: Für die aktuelle Remote-Zieladresse gilt nach RDAP2.WEB1 `mods.forrestcgn.de`.

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

- Remote-Modboard: `https://mods.forrestcgn.de`
- Hetzner Node intern: bevorzugt `127.0.0.1:3000`
- öffentlich nur HTTPS/WSS

## Webserver-Stand

Geprüft:

- Host: `web`
- OS: Debian 13 `trixie`
- nginx aktiv
- Let's Encrypt aktiv
- `mods.forrestcgn.de` per HTTPS/IPv4/IPv6 erreichbar
- Node.js `v20.19.2`
- npm `9.2.0`
- npx `9.2.0`
- apt update sauber

## Node-Neustart

Für RDAP2.WEB1 nicht nötig.

Grund:

- nur Markdown-Dokumentation im Repo
- keine Backend-Datei
- keine Dashboard-JS/CSS-Datei
- keine Overlay-HTML-Datei
- keine Config
- keine produktive DB
- kein Agent-Code
