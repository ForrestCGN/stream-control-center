# CHANGELOG

## 2026-06-26 - RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION

RDAP61 aktiviert den kontrollierten Backend-Update-Scope fuer aktive Admin-Notizen.

Geaendert:

```text
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/routes.routes.js
docs/current/RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP61.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Ergebnis:

```text
POST /api/remote/admin/users/admin-notes/update nutzt jetzt den confirmed-Service.
Create bleibt erhalten.
Update ist nur fuer aktive Notizen erlaubt.
Update schreibt nur note_text, updated_by_user_uid und updated_at.
Audit loggt keine raw note_text Inhalte.
Readback ist Pflicht.
```

Weiterhin nicht umgesetzt:

```text
Keine Update-UI.
Kein Deactivate.
Kein Delete.
Keine DB-Migration.
Keine neue Permission.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
```

Naechster empfohlener Step:

```text
RDAP61B_ADMIN_NOTE_UPDATE_BACKEND_LIVE_CONFIRMED_DOCS
```
