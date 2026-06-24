# RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## Ziel

RDAP8 bereitet einen Audit-Helper fuer spaetere Admin-User-Writes vor.

Der Step bleibt absichtlich sicher:

```text
keine produktiven Admin-Writes
keine Audit-Inserts
keine Audit-Updates
keine DB-Migration
keine UI-Schreibbuttons
keine User-/Rollen-/Gruppen-/Session-Writes
keine Agent-/OBS-/Sound-/Overlay-/Command-Actions
```

## Neue Datei

```text
remote-modboard/backend/src/services/admin-audit-write.service.js
```

Der Helper baut und prueft nur sichere Audit-Drafts.

## Geaendert

```text
remote-modboard/backend/server.js
remote-modboard/backend/package.json
remote-modboard/backend/src/services/admin-audit-write.service.js
remote-modboard/backend/src/services/admin-user-write-foundation.service.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Audit-Helper

Pflichtfelder:

```text
actorUserUid
actorLogin
action
resourceType
resourceKey
status
reason
```

Blockierte Metadaten/Keys:

```text
oauth_code
access_token
refresh_token
token
cookie
session_id
sessionId
password
secret
client_secret
env
rawBody
rawPayload
```

## Erwartete Diagnose

Statusroute:

```text
moduleBuild: RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN
statusApiVersion: rdap_admin_users8.v1
adminUsersWriteFoundation.auditHelperPrepared: true
adminUsersWriteFoundation.auditWriteEnabled: false
adminUsersWriteFoundation.writesStillBlocked: true
```

Foundation-Diagnose:

```text
auditHelperPrepared: true
auditWriteEnabled: false
auditDiagnostic.helperPrepared: true
auditDiagnostic.writeEnabled: false
writeEnabled: false
writesStillBlocked: true
```

## Lokale Tests

```powershell
cd D:\Git\stream-control-center
npm --prefix .\remote-modboard\backend run check
git status --short
```

## Webserver-Test nach stepdone/deploy

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.moduleBuild,.statusApiVersion,.adminUsersWriteFoundation.auditHelperPrepared,.adminUsersWriteFoundation.auditWriteEnabled,.adminUsersWriteFoundation.writesStillBlocked'

curl -fsS http://127.0.0.1:3010/api/remote/admin/users/write-foundation-diagnostic | jq '.moduleBuild,.statusApiVersion,.auditHelperPrepared,.auditWriteEnabled,.auditDiagnostic.helperPrepared,.auditDiagnostic.writeEnabled,.writeEnabled,.writesStillBlocked'
```

## Naechster sinnvoller Step

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
```

Scope:

```text
Locking-Helper vorbereiten
noch keine echten Locks erwerben/freigeben
keine produktiven Admin-Writes
keine DB-Migration ohne Backup/Rollback/Go
```
