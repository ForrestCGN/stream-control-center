# RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## Ziel

RDAP9 bereitet einen Locking-Helper fuer spaetere Admin-User-Writes vor, ohne produktive Lock- oder Admin-Writes zu aktivieren.

## Scope

- Locking-Helper vorbereitet.
- Keine echten Locks erwerben.
- Keine Heartbeats schreiben.
- Keine Locks freigeben.
- Keine Force-Takeover-Aktion.
- Keine DB-Migration.
- Keine UI-Schreibbuttons.
- Keine User-/Rollen-/Gruppen-/Session-Writes.

## Neue Datei

```text
remote-modboard/backend/src/services/admin-lock-write.service.js
```

## Geaenderte Dateien

```text
remote-modboard/backend/server.js
remote-modboard/backend/package.json
remote-modboard/backend/src/services/admin-user-write-foundation.service.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Diagnose

Die Foundation-Route bleibt read-only:

```text
GET /api/remote/admin/users/write-foundation-diagnostic
```

Erwartete Werte nach Deploy:

```text
moduleBuild: RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
statusApiVersion: rdap_admin_users9.v1
lockHelperPrepared: true
lockWriteEnabled: false
lockAcquireEnabled: false
lockHeartbeatEnabled: false
lockReleaseEnabled: false
lockForceTakeoverEnabled: false
writeEnabled: false
writesStillBlocked: true
```

## Sicherheitsgrenzen

Weiterhin deaktiviert:

```text
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
DB-Migration
Audit-Inserts oder Audit-Updates
Lock acquire/heartbeat/release/force-takeover
UI-Schreibbuttons
Agent-/OBS-/Sound-/Overlay-/Command-Actions
```

## Lokale Checks

```powershell
cd D:\Git\stream-control-center
npm --prefix .\remote-modboard\backend run check
git status --short
```

## Webserver-Test nach stepdone/deploy

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.moduleBuild,.statusApiVersion,.adminUsersWriteFoundation.lockHelperPrepared,.adminUsersWriteFoundation.lockWriteEnabled,.adminUsersWriteFoundation.writesStillBlocked'

curl -fsS http://127.0.0.1:3010/api/remote/admin/users/write-foundation-diagnostic | jq '.moduleBuild,.statusApiVersion,.lockHelperPrepared,.lockWriteEnabled,.lockDiagnostic.helperPrepared,.lockDiagnostic.lockAcquireEnabled,.writeEnabled,.writesStillBlocked'
```

## Naechster sinnvoller Step

```text
RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN
```

Noch kein echter Write. Zuerst Backup/Rollback fuer den kleinsten echten Admin-Write planen.
