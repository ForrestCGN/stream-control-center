# RDAP 0.2.109 - Admin Users Readonly Status Recheck

## Ziel

Live pruefen, was im Admin/User/Permission-Bereich aktiv ist.

Keine Runtime-Aenderung.

## Server-Checks

Auf dem Webserver ausfuehren:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminUsersMiniWriteFoundation,.adminNoteWritePlan,.adminNoteUpdateConfirmed'
```

```bash
curl -fsS http://127.0.0.1:3010/api/remote/admin/users/write-foundation-diagnostic | jq '.ok,.readOnly,.writeEnabled,.productiveWritesEnabled,.writesStillBlocked'
```

```bash
curl -fsS http://127.0.0.1:3010/api/remote/admin/users/permission-diagnostic | jq '.ok,.readOnly,.writeEnabled,.reason'
```

## Erwartung

```text
write-foundation-diagnostic:
readOnly=true
writeEnabled=false
productiveWritesEnabled=false
writesStillBlocked=true
```

Permission-Diagnose kann ohne Login/Auth 401 liefern. Das ist ok, solange readOnly/writeEnabled sicher bleiben.

## Wichtig

Admin-Notiz-Create/Update-Routen existieren im Code. Vor jedem weiteren Admin-Write-Scope muss live geprueft werden:

```text
Permission
Confirm
Audit
Lock
Readback
UI-Buttons
```

## Naechster moeglicher Step

```text
RDAP_0.2.110_ADMIN_USERS_LIVE_RECHECK_DOCS_OR_NEXT_RUNTIME_FIX
```

Erst nach geposteten Server-Ausgaben entscheiden.
