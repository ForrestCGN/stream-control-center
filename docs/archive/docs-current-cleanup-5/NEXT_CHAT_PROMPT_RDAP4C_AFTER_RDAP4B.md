# Neuer Chat Prompt — RDAP4C nach RDAP4B

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

RDAP4B ist abgeschlossen und per `stepdone.cmd` gespeichert.

`backend/modules/remote_agent.js` wurde im vorhandenen Modul erweitert. Es wurde kein neues Modul angelegt.

Bestätigte Routen:

```text
GET /api/remote-agent/status
GET /api/remote-agent/permissions/model
GET /api/remote-agent/locks/status
GET /api/remote-agent/audit/model
GET /api/remote-agent/routes
```

Bestätigt nach Node-Neustart:

```text
ok: true
module: remote_agent
moduleVersion: 0.0.2
moduleBuild: RDAP4B_REMOTE_AGENT_PERMISSION_LOCK_AUDIT_READONLY
statusApiVersion: rdap4b.v1
readOnly: true
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```

Weiterhin korrekt: Status ist offline, weil noch kein produktiver WSS-Agent existiert. Es gibt keine Schreibroute, keine DB-Migration und keine produktiven Agent-/OBS-/Sound-/Overlay-Aktionen.

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

Starte mit RDAP4C:

```text
RDAP4C_DASHBOARD_V2_SECURITY_MODEL_VIEW
```

Ziel: Dashboard-v2 soll auf der bestehenden Seite `Live -> Stream-PC` / `Stream-PC Verbindung` die RDAP4B read-only Daten anzeigen:

- Permissions-Modell
- Spezialrolle `sound_profi`
- Lock-Modell / Nullstatus
- Audit-Modell
- Sicherheitsgrenzen / deaktivierte produktive Capabilities

Wichtig:

- bestehende Seite/Modulstruktur nutzen
- keine neue Modulflut
- keine Schreibbuttons
- keine produktiven Aktionen
- kein Login improvisieren
- kein WSS-Agent
- keine DB-Änderung

Vor RDAP4C zuerst echte aktuelle Frontend-Dateien prüfen, insbesondere:

```text
frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx
frontend/dashboard-v2/src/services/agentClient.js
frontend/dashboard-v2/src/app/moduleRegistry.js
frontend/dashboard-v2/src/app/navigation.js
frontend/dashboard-v2/src/styles/*
```

Danach Plan vorlegen und auf mein `go` warten.
