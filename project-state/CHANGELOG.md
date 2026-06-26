# CHANGELOG

## RDAP51_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PREPARED - 2026-06-26

- Bruecke User-Detail -> Admin-Notizen als Frontend-only Polish vorbereitet.
- `rdap28-admin-notes.js` erweitert:
  - Kontext-Hinweis `adminNotesBridgeContext` in Admin-Notizen.
  - Button `Zurueck zum User-Detail`.
  - Button `Hinweis ausblenden`.
  - `window.RdapAdminNotes.openNotesForUser(user)` als Diagnose-/Komfort-API.
- Admin-Notizen-Read/Create bleiben in bestehender Implementierung.
- Keine Backend-Aenderung.
- Keine DB-Migration.
- Keine Permission-Verwaltung.
- Kein Admin-Note Update/Deactivate/Delete.

## RDAP50_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PLAN - 2026-06-26

- Bruecke User-Detail -> Admin-Notizen geplant.
- Empfehlung: Kontext-Hinweis und Ruecksprung als Frontend-only Step.
- Doku-only.
