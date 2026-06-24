# RDAP11 Lock-/Audit read-only Skeleton Prep

Stand: RDAP11_LOCK_AUDIT_READONLY_SKELETON_PREP  
Datum: 2026-06-24

## Ziel

RDAP11 bereitet die technische Lock-/Audit-Diagnose im Remote-Modboard vor. Der Schritt fuegt nur read-only Skeleton-Code und Doku hinzu.

Dieser Stand aktiviert keine produktiven Schreibfunktionen.

## Ausgangsstand

Bestaetigter vorheriger Stand:

```text
RDAP10_LOCK_AUDIT_IMPLEMENTATION_PLAN_READONLY
```

Bestaetigter Sicherheitsrahmen bleibt:

```text
readOnly=true
writeEnabled=false
authEnabled=false
loginEnabled=false
databaseWriteEnabled=false
agentActionsEnabled=false
productivePermissionEnforcementEnabled=false
```

## Geaenderte Dateien

```text
remote-modboard/backend/package.json
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/services/lock-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
docs/current/RDAP11_LOCK_AUDIT_READONLY_SKELETON_PREP.md
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Neue read-only Diagnose-Route

```text
GET /api/remote/lock-audit/status
```

Standardverhalten ohne `db=1`:

```text
keine DB-Abfrage
nur Capabilities/Safety/Status
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
lockAcquireEnabled=false
lockHeartbeatEnabled=false
lockReleaseEnabled=false
lockForceTakeoverEnabled=false
auditInsertEnabled=false
auditUpdateEnabled=false
agentActionsEnabled=false
```

Optional mit `db=1`:

```text
GET /api/remote/lock-audit/status?db=1
```

Dann werden nur read-only `INFORMATION_SCHEMA.COLUMNS`-SELECTs gegen MariaDB ausgefuehrt, um die erwarteten Tabellen/Spalten diagnostisch zu pruefen:

```text
dashboard_locks
dashboard_audit_log
```

Es werden keine Tabellen erstellt, keine Migrationen ausgefuehrt und keine Daten geschrieben.

## Neue Services

### lock-read.service.js

Zweck:

```text
Lock-Diagnose read-only
Tabellen-/Spaltenpruefung nur per SELECT
keine Lock-Erstellung
kein Lock-Heartbeat
keine Lock-Freigabe
keine Lock-Übernahme
```

Erwartete Lock-Spalten laut Skeleton:

```text
id
lock_id
resource_type
resource_key
resource_version
edit_session_id
user_uid
client_id
heartbeat_at
expires_at
created_at
updated_at
released_at
```

### audit-read.service.js

Zweck:

```text
Audit-Diagnose read-only
Tabellen-/Spaltenpruefung nur per SELECT
keine Audit-Insert-Funktion
keine Audit-Update-Funktion
keine Secrets/Rohpayloads
```

Erwartete Audit-Spalten laut Skeleton:

```text
id
request_id
correlation_id
actor_user_uid
actor_login
action
resource_type
resource_key
status
error_code
safe_metadata_json
created_at
completed_at
```

## App-/Routen-Einbindung

`src/app.js` registriert neu:

```text
registerLockAuditDiagnosticRoutes(app, context)
```

`src/routes/routes.routes.js` listet die neue Route in `/api/remote/routes`.

`package.json` erweitert `npm run check` um:

```text
src/routes/lock-audit-diagnostic.routes.js
src/services/lock-read.service.js
src/services/audit-read.service.js
```

## Weiterhin verboten / nicht aktiviert

```text
kein Login
kein Twitch-OAuth
kein Redirect zu Twitch
kein OAuth-Code-gegen-Token-Tausch
keine Cookies
keine Session-Erstellung
keine Session-Verlaengerung
kein last_seen_at Update
keine produktiven DB-Writes
keine Remote-Writes
keine User-/Rollen-/Gruppen-Schreibrouten
keine Lock-Writes
kein Lock acquire
kein Lock heartbeat
kein Lock release
kein Lock force takeover
keine Audit-Writes
kein Audit insert
kein Audit update
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine produktive Permission-Erzwingung fuer Writes
keine Secrets im Repo, Frontend, Log oder Chat
keine bestehenden Routen entfernen
keine Funktionalitaet entfernen
```

## Erwartete Tests lokal

Im lokalen Repo nach Einspielen:

```text
cd remote-modboard/backend
npm run check
```

Danach:

```text
git status --short
```

## Erwartete Tests live nach Deploy

Nur wenn Live-Deploy separat freigegeben wird:

```text
curl -sS http://127.0.0.1:3010/api/remote/status
curl -sS http://127.0.0.1:3010/api/remote/routes
curl -sS http://127.0.0.1:3010/api/remote/lock-audit/status
curl -sS http://127.0.0.1:3010/api/remote/lock-audit/status?db=1
curl -i  http://127.0.0.1:3010/api/remote/auth/twitch/start
curl -i  http://127.0.0.1:3010/api/remote/auth/twitch/callback
```

Erwartung:

```text
/api/remote/lock-audit/status vorhanden
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
lockAcquireEnabled=false
auditInsertEnabled=false
agentActionsEnabled=false
OAuth-Start weiterhin 403
OAuth-Callback weiterhin 403
kein Set-Cookie
kein Redirect
keine DB-Writes
```

## Node-/Backend-Neustart

Fuer lokalen Syntax-Check: nein.  
Fuer Live-Test nach Deploy: ja, weil neue Backend-Route geladen werden muss.

## Ergebnis RDAP11

RDAP11 liefert ein read-only Lock-/Audit-Diagnose-Skeleton. Die Route und Services sind vorbereitet, aber alle produktiven Schreibpfade bleiben deaktiviert.

## Naechster sinnvoller Schritt

```text
RDAP11B_LOCK_AUDIT_READONLY_LOCAL_TEST
```

Ziel:

```text
RDAP11 lokal einspielen, npm run check ausfuehren, Status pruefen und erst danach StepDone.
```

Danach separat:

```text
RDAP11C_LOCK_AUDIT_READONLY_LIVE_DEPLOY_TEST
```

Nur mit eigenem Server-Scope, Backup, Deploy nach /opt/stream-control-center/_deploy_tmp/ und Live-Test auf 127.0.0.1:3010.
