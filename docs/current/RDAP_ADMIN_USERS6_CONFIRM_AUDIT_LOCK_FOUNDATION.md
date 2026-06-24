# RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## Ziel

RDAP6 bereitet die spätere Admin-Userverwaltung vor, ohne produktive Writes zu aktivieren.

Dieser Step baut nur eine read-only Foundation-Diagnose für:

```text
Confirm-Write
Audit-Pflicht
Locking-Pflicht
Backup/Rollback-Pflicht
Owner/Admin-Grenzen
geplante Admin-User-Actions
```

## Neue Route

```text
GET /api/remote/admin/users/write-foundation-diagnostic
```

Die Route schreibt nichts und zeigt nur an, welche Regeln spätere produktive Admin-Writes erfüllen müssen.

## Sicherheitsgrenzen

Weiterhin deaktiviert:

```text
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
DB-Migration
UI-Schreibbuttons
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
Secrets im Repo/Frontend/Chat
```

## Geplante spätere Resource-Keys

```text
admin_user:user:<userUid>
admin_user:role:<roleKey>
admin_user:group:<groupKey>
admin_user:session:<sessionId>
admin_user:permission:<permissionKey>
```

## Geplante spätere Actions

```text
admin.users.approve
admin.users.block
admin.users.role.grant
admin.users.role.revoke
admin.users.group.grant
admin.users.group.revoke
admin.users.session.revoke
admin.users.permission.grant
admin.users.permission.revoke
```

## Confirm-Write-Regel

Spätere produktive Admin-Writes brauchen explizites Confirm-Write, z. B.:

```text
confirmWrite=true
```

Ohne Confirm darf keine produktive Änderung ausgeführt werden.

## Audit-Regel

Jede spätere produktive Admin-Aktion muss nachvollziehbar protokollieren:

```text
actor_user_uid
actor_login
action
target_type
target_uid
before_json
after_json
reason
created_at
```

Ziel-Tabelle:

```text
dashboard_audit_log
```

## Locking-Regel

Produktive Admin-Änderungen brauchen später Locking über:

```text
dashboard_locks
```

Geplante Logik:

```text
Lock erwerben
Änderung ausführen
Audit schreiben
Lock freigeben
Timeout/Heartbeat/Owner-Übernahme beachten
```

## Owner/Admin-Grenze

Owner:

```text
darf später kritische Admin-Sicherheitsbereiche verwalten
darf später Admin-/Owner-Grenzen ändern, aber nur mit eigenem Scope/Confirm/Audit/Locking
```

Admin:

```text
darf später normale User-/Freigabe-Verwaltung übernehmen
darf keine Owner-Sicherheitsgrenzen ohne separaten Scope ändern
```

Sound-Profi:

```text
ist keine Admin-Rolle
ist später Gruppe/Freigabe/Modulrecht
darf keine User/Rollen/Secrets/Systemrechte verwalten
```

## Lokale/LAN-Planung

Local/LAN/Twitch-Login bleibt als TODO geparkt:

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

Erst weiterführen, wenn das Web-Dashboard stabiler ist.

## Tests lokal

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\src\services\admin-user-write-foundation.service.js
node --check .\remote-modboard\backend\src\routes\admin-users.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node -e "JSON.parse(require('fs').readFileSync('.\remote-modboard\backend\package.json','utf8')); console.log('package.json ok')"

git status
```

## Webserver-Test nach stepdone/deploy

```bash
curl -i http://127.0.0.1:3010/api/remote/status
curl -fsS http://127.0.0.1:3010/api/remote/routes | grep -i "write-foundation"
curl -i http://127.0.0.1:3010/api/remote/admin/users/write-foundation-diagnostic
```

Erwartung:

```text
HTTP 200
readOnly: true
writeEnabled: false
writesStillBlocked: true
confirmWriteRequired: true
auditRequired: true
lockingRequired: true
```

## Nächster sinnvoller Step

```text
RDAP_ADMIN_USERS7_DISABLED_WRITE_HELPERS_PLAN
```

oder kleiner:

```text
RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED
```

Weiterhin ohne echte User-/Rollen-Writes, bis Backup/Rollback und Actor/Audit/Locking vollständig geprüft sind.
