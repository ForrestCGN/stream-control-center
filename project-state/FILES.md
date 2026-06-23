# FILES

Stand: RDAP3.DOC1 / Minimal-Agent-Konzept dokumentiert  
Datum: 2026-06-23

## Art des aktuellen Doku-Stands

Infrastruktur-/Doku-/Planungsstand.

Es wurden keine `stream-control-center`-Runtime-Dateien geändert.

## Neu / aktualisiert

- `docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md`
- `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
- `docs/current/REMOTE_DASHBOARD_AGENT_RDAP2_DECISIONS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`
- `project-state/CHANGELOG_RDAP3_MINIMAL_AGENT_PLAN_2026-06-23.md`

## Neue RDAP3-Plan-Datei

### `docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md`

Enthält:

- Minimal-Agent-Zielbild
- separater Node-Agent-Prozess
- Agent-Config-Plan
- WSS-Verbindung
- Auth/Handshake mit `agentId` + Secret
- Heartbeat
- Basisstatus
- `agent.ping`
- `agent.status.request`
- Request-Struktur
- Result-Struktur
- Audit-Vorbereitung
- Offline-/Reconnect-Verhalten
- klare Abgrenzung: keine produktiven Aktionen
- klare Abgrenzung: kein Code in RDAP3

## Aktualisierte RDAP2-Plan-Dateien

### `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`

Aktualisiert:

- alte Planungs-Subdomain im Entscheidungsblock auf `mods.forrestcgn.de` nachgezogen
- RDAP3-Minimal-Agent-Verweis ergänzt
- weiterhin grober Architekturplan

### `docs/current/REMOTE_DASHBOARD_AGENT_RDAP2_DECISIONS.md`

Aktualisiert:

- Hinweis ergänzt, dass `mods.forrestcgn.de` der führende aktuelle Remote-Modboard-Zielname ist
- alte Subdomain `modboard.forrestcgn.de` bleibt nur als historische Planungsreferenz relevant

## Projektstatus-Dateien

### `project-state/CURRENT_STATUS.md`

Enthält aktuellen Stand:

- RDAP3.DOC1 dokumentiert
- RDAP2.WEB1 bleibt gültig
- RDAP2-Architektur bleibt gültig
- DASHUI1 Designbasis bleibt gültig
- keine Runtime-/Code-/DB-/Config-Änderungen

### `project-state/NEXT_STEPS.md`

Aktualisiert auf nächsten sinnvollen Schritt:

- RDAP4 / Permission- und Edit-Session-/Lock-Datenmodell planen

### `project-state/TODO.md`

Aktualisiert:

- RDAP3-Minimal-Agent-Konzept als geplant markiert
- offene Punkte für späteren Agent-Umsetzungsstep ergänzt
- RDAP4/Rollen/Locks weiterhin offen

### `project-state/FILES.md`

Diese Datei.

### `project-state/CHANGELOG.md`

RDAP3.DOC1 als neuer Changelog-Eintrag ergänzt.

### `project-state/CHANGELOG_RDAP3_MINIMAL_AGENT_PLAN_2026-06-23.md`

Eigene changelogartige Detaildatei für diesen Step.

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

- `docs/current/START_HERE_FOR_NEW_CHAT.md`
- `docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt`
- `docs/current/REMOTE_DASHBOARD_WEB_SERVER_STATUS_2026-06-23.md`
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

Geprüft aus RDAP2.WEB1:

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

Für RDAP3.DOC1 nicht nötig.

Grund:

- nur Markdown-Dokumentation im Repo
- keine Backend-Datei
- keine Dashboard-JS/CSS-Datei
- keine Overlay-HTML-Datei
- keine Config
- keine produktive DB
- kein Agent-Code
