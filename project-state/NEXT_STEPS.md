# NEXT_STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS17B_ROUTE_LIST_SYNC  
Datum: 2026-06-25

## Jetzt prüfen

Nach Deploy von RDAP17B:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .adminUserAdminNoteReadDiagnostic'

curl -fsS "http://127.0.0.1:3010/api/remote/admin/users/admin-note-read-diagnostic?targetUserUid=test" | jq '.ok, .readOnly, .writesStillBlocked, .returnsNoteText, .noteTextIsRedacted, .totalCount'
```

## Naechster Fachstep danach

Erst nach bestaetigtem RDAP17B:

```text
RDAP_ADMIN_USERS18_ADMIN_NOTE_WRITE_DISABLED_FOUNDATION
```

RDAP18 darf weiterhin keine produktiven Writes aktivieren. Es darf hoechstens eine disabled Write-Foundation fuer Admin-Notizen vorbereiten.
