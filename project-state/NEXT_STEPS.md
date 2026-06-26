# NEXT_STEPS

Stand: RDAP60_ADMIN_NOTES_UPDATE_DEACTIVATE_SCOPE_PLAN  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
```

## Ziel

```text
Nur den kleinsten Admin-Note Update-Backend-Scope bauen.
```

## Richtung

```text
- Bestehende Admin-Notes-Struktur nutzen.
- Bestehende Route /api/remote/admin/users/admin-notes/update erst nach Plan gezielt aktivieren.
- Keine neue Parallelroute bauen, solange admin-users.routes.js fachlich passt.
- Keine Deactivate-Funktion im selben Step.
- Kein Delete.
- Keine Community-Read-Freigabe.
- Keine Permission-/Rollen-/Gruppen-Writes.
```

## Vorher pruefen

```text
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP60.md
docs/current/RDAP60_ADMIN_NOTES_UPDATE_DEACTIVATE_SCOPE_PLAN.md
docs/current/RDAP59_ADMIN_NOTES_COMMUNITY_READ_SCOPE_PLAN.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Fuer RDAP61-Codeplanung zusaetzlich:

```text
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-disabled.service.js
remote-modboard/backend/src/services/admin-confirm-write.service.js
remote-modboard/backend/src/services/admin-audit-write.service.js
remote-modboard/backend/src/services/admin-lock-write.service.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/app.js
```

## Geplanter Update-Scope

```text
targetUserUid
noteUid
noteText
confirmWrite: true
```

Server setzt:

```text
note_text
updated_by_user_uid
updated_at
```

Pflichtschutz:

```text
Session
DashboardAccess
remote.view
admin.users.note.write
confirmWrite nur Body
Lock
Audit ohne raw note_text
Readback
DB-Backup vor produktivem Test
```

## Nicht in RDAP61 bauen

```text
Admin-Note Deactivate
Physisches Delete
Community-Read
Public/Profile/Self-Service Admin-Note-Ausgabe
Permission-Verwaltung
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation
Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
```

## Alternative, falls noch kein Backend-Write gewuenscht ist

```text
RDAP61_ADMIN_NOTES_READ_ONLY_UI_STATUS_POLISH
```

Nur UI/Status-Polish ohne neue Route, ohne DB, ohne Writes.
