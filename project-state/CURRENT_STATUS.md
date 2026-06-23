# CURRENT STATUS

Stand: RDAP4C2_DASHBOARD_V2_REMOTE_AGENT_ADMIN_SPLIT_TESTED  
Datum: 2026-06-23

## Aktueller bestätigter Stand

RDAP4B wurde eingespielt, Node wurde neu gestartet, die API wurde geprüft und der Step wurde per `stepdone.cmd` abgeschlossen.

RDAP4B erweitert das vorhandene Backend-Modul:

```text
backend/modules/remote_agent.js
```

um read-only Modellrouten für Permissions, Locks und Audit. Es wurde bewusst **kein neues Backend-Modul** angelegt.

RDAP4C/C2 hat danach Dashboard-v2 erweitert:

- `agentClient.js` lädt die vorhandenen RDAP4B read-only Routen.
- `Live -> Stream-PC` zeigt wieder nur die Betriebs-/Verbindungsübersicht.
- Technische Sicherheitsmodelle wurden in vorhandene Admin-Bereiche verschoben:
  - `Admin -> Benutzer & Rechte`
  - `Admin -> Locks`
  - `Admin -> Audit`

## Bestätigte RDAP4B-Routen

```text
GET /api/remote-agent/status
GET /api/remote-agent/permissions/model
GET /api/remote-agent/locks/status
GET /api/remote-agent/audit/model
GET /api/remote-agent/routes
```

Bestätigter Status:

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

## Bestätigte Sicherheitslage

- `permissionsModel`, `locksStatus` und `auditModel` sind als read-only Capabilities aktiv.
- Alle produktiven Capabilities bleiben deaktiviert.
- Status bleibt `offline`, weil noch kein produktiver WSS-Agent existiert.
- Es gibt keine Schreibroute.
- Es gibt keine produktive Agent-Ausführung.
- Es gibt keine DB-Migration und keine SQLite-Änderung.
- Es gibt kein Login/Auth-System in Dashboard-v2.
- Es gibt keine OBS-/Sound-/Overlay-/Media-/Text-/Config-/Command-Steuerung.

## Dashboard-v2 aktueller Aufbau

### Live -> Stream-PC

Betriebs-/Verbindungsübersicht:

- Stream-PC Verbindung
- Offline/Online-Status
- Letzter Kontakt / Heartbeat
- Lokaler Stream-PC
- Remote-Modboard Ziel
- Sicherheitsgrenzen als Kurzstatus
- API-Zustand kurz

### Admin -> Benutzer & Rechte

Read-only Sicherheitsmodell:

- Rollenmodell
- Permissions-Modell
- Spezialrolle `sound_profi`
- Role-Permission-Presets
- Hinweis: Twitch-Rollen sind nicht automatisch Dashboard-Rechte

### Admin -> Locks

Read-only Lock-Modell:

- Lock-Nullstatus
- Resource-Key-Format
- Heartbeat/Timeout
- Takeover-Regeln
- aktive Locks aktuell 0

### Admin -> Audit

Read-only Audit-Modell:

- Mindestfelder
- Eventtypen
- Quellen
- Retention-Hinweis
- Read-only API-Routen

## Geänderte Dateien durch RDAP4C/C2

```text
frontend/dashboard-v2/src/services/agentClient.js
frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx
frontend/dashboard-v2/src/modules/admin/AdminUsersPage.jsx
frontend/dashboard-v2/src/modules/admin/AdminLocksPage.jsx
frontend/dashboard-v2/src/modules/admin/AdminAuditPage.jsx
frontend/dashboard-v2/src/app/moduleRegistry.js
frontend/dashboard-v2/src/app/navigation.js
```

## Nicht geändert durch RDAP4C/C2

- kein Backend-Code
- keine produktive SQLite
- keine DB-Migration
- keine Schreibroute
- kein produktiver WSS-Agent
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-Steuerung
- keine Commands-/Kanalpunkte-Steuerung
- keine Datei-/Shell-/Prozesssteuerung
- kein neues Hauptmodul

## Wichtige Leitplanken

- Keine produktive SQLite ersetzen oder löschen.
- Keine Schreibfunktionen ohne Permission/Lock/Audit.
- Keine Agent-Aktionen ohne Allowlist.
- Keine freie Shell-/Datei-/Prozesssteuerung.
- Frontend zeigt Rechte nur an; Backend entscheidet.
- Bestehende Module nutzen, kein Modul-Wildwuchs.
- Normale Live-Seiten streamer-/modfreundlich halten.
- Technische Rechte-/Lock-/Audit-Dinge gehören in Admin.
