# NEXT_STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS17_ADMIN_NOTE_READ_DIAGNOSTIC  
Datum: 2026-06-25

## Aktuell erledigt

```text
RDAP16 Admin-Notiz-Tabelle angelegt
schemaReady true
rowCount 0
Writes weiter blockiert
```

## Aktueller Step

```text
RDAP_ADMIN_USERS17_ADMIN_NOTE_READ_DIAGNOSTIC
```

Ziel:

```text
Read-only Diagnose für Admin-Notizen ergänzen.
Keine Notiztexte ausgeben.
Keine produktiven Writes.
```

## Nach RDAP17 testen

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminUsersAdminNoteReadDiagnostic'
curl -fsS http://127.0.0.1:3010/api/remote/admin/users/admin-note-read-diagnostic | jq
curl -fsS 'http://127.0.0.1:3010/api/remote/admin/users/admin-note-read-diagnostic?targetUserUid=test-user' | jq
```

## Nächster möglicher Fach-Step danach

```text
RDAP_ADMIN_USERS18_ADMIN_NOTE_UI_READONLY_PLAN
```

Vor echter Anzeige von Notiztexten zuerst klären:

```text
Auth/Session aktiv?
Permission admin.users.note.read?
Darf ein Mod diese Notizen sehen?
Welche Rollen dürfen Notiztexte sehen?
Audit bei Anzeige nötig oder nur bei Write?
```

Admin-Notiz-Write bleibt separat und darf erst mit Permission, Confirm-Write, Audit, Lock und Read-Back gebaut werden.
