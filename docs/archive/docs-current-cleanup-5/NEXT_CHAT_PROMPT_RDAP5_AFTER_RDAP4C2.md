# NEXT CHAT PROMPT – RDAP5 nach RDAP4C2

Wir arbeiten am Projekt `stream-control-center` von ForrestCGN.

Bitte zuerst den aktuellen Repo-/Doku-Stand prüfen und nicht raten.

## Projekt

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Lokaler Server: http://127.0.0.1:8080
Altes Dashboard: http://127.0.0.1:8080/dashboard/
Neues Dashboard-v2: http://127.0.0.1:8080/dashboard-v2/
Produktive DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
Remote-Modboard: https://mods.forrestcgn.de
```

## Zuerst zwingend lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md
docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md
docs/current/DASHBOARD_V2_REACT_V13_ALIGNMENT.md
```

## Aktueller bestätigter Stand

RDAP4C2 ist der aktuelle Dashboard-v2 Strukturstand.

RDAP4B Backend/API bleibt unverändert:

```text
backend/modules/remote_agent.js
moduleVersion: 0.0.2
moduleBuild: RDAP4B_REMOTE_AGENT_PERMISSION_LOCK_AUDIT_READONLY
statusApiVersion: rdap4b.v1
readOnly: true
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```

Bestätigte Routen:

```text
GET /api/remote-agent/status
GET /api/remote-agent/permissions/model
GET /api/remote-agent/locks/status
GET /api/remote-agent/audit/model
GET /api/remote-agent/routes
```

Dashboard-v2 Struktur:

```text
Live -> Stream-PC
  nur Betriebs-/Verbindungsübersicht

Admin -> Benutzer & Rechte
  Permissions-Modell, Rollen, sound_profi, Presets

Admin -> Locks
  Lock-Modell und Nullstatus

Admin -> Audit
  Audit-Modell und read-only API-Routen
```

Weiterhin korrekt:

```text
Status offline, weil noch kein produktiver WSS-Agent existiert.
Keine Schreibroute.
Keine DB-Migration.
Keine produktiven Agent-/OBS-/Sound-/Overlay-Aktionen.
Kein Login/Auth-System.
```

## Arbeitsweise, unbedingt einhalten

- Immer zuerst echte Dateien prüfen, nicht raten.
- Wenn Dateien fehlen, exakt diese Dateien anfordern.
- Vor Code-/ZIP-Änderungen erst Plan nennen: Ziel, betroffene Dateien, Nicht-Änderungen, Tests.
- Umsetzung erst nach meinem ausdrücklichen `go`.
- Keine Funktionalität entfernen.
- Keine produktive SQLite löschen, ersetzen oder neu bauen.
- Keine DB-Migration ohne separaten Plan und separates Go.
- Vorhandene Module/Helper nutzen, kein Modul-Wildwuchs.
- ZIPs immer mit echten Zielpfaden ab Repo-Root liefern.
- Übergabe-/Input-ZIPs bevorzugt unter `D:\Git\stream-control-center\_handoff\`, nicht Desktop.
- Downloads liegen im normalen Downloads-Ordner.
- `installstep.cmd` spielt ZIPs ein und startet `testdeploy.cmd`.
- `stepdone.cmd` erst nach erfolgreichem Live-Test.
- Bei Fehlern `stepundo.cmd` nutzen.

## Nächster Auftrag

Starte mit:

```text
RDAP5_REMOTE_AUTH_USER_MODEL_PLAN
```

Ziel:

Planen, wie Login/User/Rollen/Permission-Grants für das spätere Remote-Modboard sicher aufgebaut werden.

Wichtig:

- Nur Planung.
- Keine Umsetzung.
- Keine DB-Migration.
- Keine produktive Schreibfunktion.
- Kein Login improvisieren.
- Kein WSS-Agent.
- Keine Secrets ins Repo oder Frontend.
- Bestehende Helper/Patterns prüfen.
- Backend entscheidet Rechte, Frontend zeigt nur an.
- Twitch-Rollen dürfen berücksichtigt werden, aber lokale Dashboard-Rollen/Rechte entscheiden konkret.
- Spezialrolle `sound_profi` berücksichtigen.
- Locks und Audit als Pflicht für spätere Schreibfunktionen einplanen.

Vor RDAP5 zuerst echte Dateien prüfen, insbesondere:

```text
backend/modules/remote_agent.js
backend/modules/helpers/helper_security.js
backend/modules/helpers/helper_routes.js
backend/modules/helpers/helper_config.js
backend/modules/helpers/helper_state.js
backend/core/security.js
backend/core/config.js
backend/core/paths.js
frontend/dashboard-v2/src/app/moduleRegistry.js
frontend/dashboard-v2/src/app/navigation.js
frontend/dashboard-v2/src/modules/admin/AdminUsersPage.jsx
project-state/*
docs/current/*
```

Danach Plan vorlegen und auf mein `go` warten.
