# CHANGELOG

## RDAP31_ADMIN_NOTE_WRITE_BACKEND_DISABLED_UI - 2026-06-25

- Neue gesperrte Backend-Validierungsrouten fuer Admin-Notizen vorbereitet:
  - `POST /api/remote/admin/users/admin-notes/create`
  - `POST /api/remote/admin/users/admin-notes/update`
  - `POST /api/remote/admin/users/admin-notes/deactivate`
- Neue Service-Datei:
  - `admin-user-admin-note-write-disabled.service.js`
- Routenliste `/api/remote/routes` um RDAP31-Status erweitert.
- Routen pruefen Session, Dashboard-Zugriff, `remote.view`, `admin.users.note.write`, Confirm-Write, Input, Schema, Zieluser, Audit-Draft und Lock-Draft.
- Routen schreiben absichtlich nicht.
- Keine UI-Schreibbuttons.
- Keine Permission-Vergabe.
- Kein physisches Delete.
- Naechster Step: Audit-/Lock-Write echte Grundlage.
