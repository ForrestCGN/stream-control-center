# RDAP_ADMIN_USERS17B_ROUTE_LIST_SYNC

Stand: 2026-06-25  
Projekt: stream-control-center / Remote-Modboard

## Zweck

RDAP17B synchronisiert nur die read-only Routenuebersicht `/api/remote/routes` mit der bereits live funktionierenden RDAP17-Route:

```text
GET /api/remote/admin/users/admin-note-read-diagnostic
```

## Anlass

RDAP17 wurde deployed und die Route antwortet korrekt read-only:

```text
diagnosticBuild: RDAP_ADMIN_USERS17_ADMIN_NOTE_READ_DIAGNOSTIC_READONLY
statusApiVersion: rdap_admin_users17.v1
readOnly: true
writesStillBlocked: true
returnsNoteText: false
noteTextIsRedacted: true
tableExists: true
schemaReady: true
totalCount: 0
```

Die Routenuebersicht lieferte aber noch:

```text
.adminUserAdminNoteReadDiagnostic = null
```

## Änderung

Nur `remote-modboard/backend/src/routes/routes.routes.js` wurde aktualisiert:

- Route in `routes[]` ergänzt.
- Key `adminUserAdminNoteReadDiagnostic` ergänzt.
- Alias-Key `adminUsersAdminNoteReadDiagnostic` ergänzt.
- `statusApiVersion` der Routenuebersicht auf `rdap_admin_users17b.v1` gesetzt.

## Nicht geändert

- Keine DB-Migration.
- Keine SQL-Ausfuehrung.
- Keine Notiztexte.
- Keine Writes.
- Keine UI-Schreibbuttons.
- Keine User-Freigaben.
- Keine Rollen.
- Keine Sessions.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.

## Erwartete Checks

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .adminUserAdminNoteReadDiagnostic'

curl -fsS "http://127.0.0.1:3010/api/remote/admin/users/admin-note-read-diagnostic?targetUserUid=test" | jq '.ok, .readOnly, .writesStillBlocked, .returnsNoteText, .noteTextIsRedacted, .totalCount'
```

Erwartung:

```text
rdap_admin_users17b.v1
prepared: true
routeListKeySynced: true
writeEnabled: false
writesStillBlocked: true
returnsNoteText: false
noteTextIsRedacted: true
```
