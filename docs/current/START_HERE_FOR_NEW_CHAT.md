# START HERE FOR NEW CHAT

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Aktueller Stand: RDAP4C2_DASHBOARD_V2_REMOTE_AGENT_ADMIN_SPLIT_TESTED

## Diese Datei zuerst lesen

In einem neuen Chat immer zuerst diese Datei lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
```

Danach mindestens diese Dateien prüfen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md
docs/current/DASHBOARD_V2_REACT_V13_ALIGNMENT.md
docs/current/DASHBOARD_V2_BUILD_LOCAL_DELIVERY.md
docs/current/DASHBOARD_V2_STATIC_ROUTE.md
docs/current/WF1_FRONTEND_GIT_WORKFLOW.md
docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md
docs/current/NEXT_CHAT_PROMPT_RDAP5_AFTER_RDAP4C2.md
```

## Repository und Pfade

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Lokaler Server: http://127.0.0.1:8080
Altes Dashboard: http://127.0.0.1:8080/dashboard/
Neues Dashboard-v2: http://127.0.0.1:8080/dashboard-v2/
Produktive SQLite: D:\Streaming\stramAssets\data\sqlite\app.sqlite
Remote-Modboard: https://mods.forrestcgn.de
Übergabe-ZIPs bevorzugt: D:\Git\stream-control-center\_handoff\
Downloads: %USERPROFILE%\Downloads
```

## Aktueller bestätigter Stand

```text
RDAP4C2 Dashboard-v2 verteilt das RDAP4B Sicherheitsmodell sauber auf vorhandene Admin-Bereiche.
```

Bestätigt:

- Dashboard-v2 läuft lokal unter `/dashboard-v2/`.
- Bestehendes Dashboard bleibt unter `/dashboard/` produktiv.
- Dashboard-v2 Build-Output liegt unter `htdocs/dashboard-v2/`.
- Deploy-Workflow nimmt `htdocs/dashboard-v2/` mit nach Live.
- `backend/modules/remote_agent.js` bleibt das vorhandene Modul für Remote-/Stream-PC-Anbindung.
- RDAP4B Backend/API bleibt unverändert.
- RDAP4C/C2 ergänzt nur Dashboard-v2 Frontend-Anzeige.
- `Live -> Stream-PC` ist wieder eine normale Betriebs-/Verbindungsübersicht.
- Technische Security-Modellansichten liegen jetzt in vorhandenen Admin-Bereichen:
  - `Admin -> Benutzer & Rechte`
  - `Admin -> Locks`
  - `Admin -> Audit`

## Aktuelle RDAP4B API-Routen

```text
GET /api/remote-agent/status
GET /api/remote-agent/permissions/model
GET /api/remote-agent/locks/status
GET /api/remote-agent/audit/model
GET /api/remote-agent/routes
```

Bestätigte Sicherheitswerte:

```text
module: remote_agent
moduleVersion: 0.0.2
moduleBuild: RDAP4B_REMOTE_AGENT_PERMISSION_LOCK_AUDIT_READONLY
statusApiVersion: rdap4b.v1
readOnly: true
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```

Der Offline-Status ist aktuell korrekt, weil noch kein produktiver WSS-Agent existiert.

## Dashboard-v2 Struktur nach RDAP4C2

### Live -> Stream-PC

Soll nur Betriebsstatus zeigen:

```text
Stream-PC Verbindung
Offline/Online-Status
Letzter Kontakt
Heartbeat
Lokaler Stream-PC
Remote-Modboard Ziel
Sicherheitsgrenzen als Kurzstatus
API-Zustand kurz
```

### Admin -> Benutzer & Rechte

Zeigt read-only:

```text
Permissions-Modell
Rollenmodell
Spezialrolle sound_profi
Role-Permission-Presets
Twitch-Rollen sind nicht automatisch Dashboard-Rechte
```

### Admin -> Locks

Zeigt read-only:

```text
Lock-Modell
Nullstatus
Resource-Key-Format
Heartbeat/Timeout
Takeover-Regeln
aktive Locks: aktuell 0
```

### Admin -> Audit

Zeigt read-only:

```text
Audit-Modell
Mindestfelder
Eventtypen
Quellen
Retention-Hinweis
Read-only API-Routen
```

## Weiterhin bewusst nicht aktiv

```text
kein produktiver WSS-Agent
keine Agent-Actions
keine Schreibroute
keine DB-Migration
keine OBS-Steuerung
keine Sound-Steuerung
keine Overlay-Steuerung
keine Commands-/Kanalpunkte-Steuerung
keine Datei-/Shell-/Prozesssteuerung
kein Login/Auth improvisiert
```

## Wichtige aktuelle Dateien

```text
backend/modules/remote_agent.js
backend/server.js
backend/core/paths.js

frontend/dashboard-v2/src/services/agentClient.js
frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx
frontend/dashboard-v2/src/modules/admin/AdminUsersPage.jsx
frontend/dashboard-v2/src/modules/admin/AdminLocksPage.jsx
frontend/dashboard-v2/src/modules/admin/AdminAuditPage.jsx
frontend/dashboard-v2/src/app/moduleRegistry.js
frontend/dashboard-v2/src/app/navigation.js

frontend/dashboard-v2/
htdocs/dashboard-v2/
build-dashboard-v2.cmd
testdeploy.cmd
stepdone.cmd
stepundo.cmd
```

## Verbindliche Designbasis

Dashboard-v2 bleibt auf Designbasis V13 / Topbar Tab inline:

```text
docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md
docs/current/DASHBOARD_V2_REACT_V13_ALIGNMENT.md
```

Wichtige Punkte:

- Galaxy-/Glassmorphism-Hintergrund
- feste Topbar
- kompakte Sidebar als Accordion
- Hauptkategorie -> Modul
- keine dritte Sidebar-Ebene
- Moduldetails innerhalb der Modulseite
- ruhige dunkle CGN-Neon-Flächen
- normale Bereiche streamer-/modfreundlich halten
- technische Dinge gehören in Admin oder zentrale Admin-Dialoge

## Verbindliche Arbeitsweise

- Zuerst echte Dateien/Repo-/Live-Stand prüfen, nicht raten.
- Vor Code-/ZIP-Änderungen Scope, betroffene Dateien, Nicht-Änderungen und Tests nennen.
- Umsetzung erst nach Forrests ausdrücklichem `go`.
- Bei fehlenden Dateien exakt diese Dateien anfordern.
- Keine Funktionalität entfernen.
- Keine produktive SQLite ersetzen, löschen oder neu bauen.
- Keine DB-Migration ohne separaten Plan und separates Go.
- Vorhandene Module/Helper nutzen; kein Modul-Wildwuchs.
- ZIPs mit echten Zielpfaden ab Repo-Root liefern.
- Übergabe-/Input-ZIPs bevorzugt unter `_handoff`, nicht Desktop.
- Downloads liegen im normalen Downloads-Ordner.
- `installstep.cmd` spielt ZIPs ein und startet `testdeploy.cmd`.
- `stepdone.cmd` erst nach erfolgreichem Live-Test.
- `stepundo.cmd` nutzen, wenn ein Teststand kaputt ist.

## Nächster sinnvoller Schritt

```text
RDAP5_REMOTE_AUTH_USER_MODEL_PLAN
```

Ziel:

- Login-/User-/Rollen-/Grant-Modell für Remote-Modboard planen.
- Noch keine Umsetzung.
- Noch keine DB-Migration.
- Noch keine produktive Schreibfunktion.
- Zuerst bestehende DB-/Helper-/Security-Patterns prüfen.
- Danach separater Plan und separates `go`.

Alternative vor RDAP5, falls Forrest erst Optik/UX glätten möchte:

```text
DASHV2_ADMIN_SECURITY_VIEW_POLISH
```

Ziel:

- Admin-Security-Seiten noch lesbarer machen.
- Keine neue Funktion.
- Keine API-/Backend-/DB-Änderung.
