# CHANGELOG

## RDAP40B_ADMIN_NOTE_CREATE_UI_LIVE_CONFIRMED_DOCS - 2026-06-25

- RDAP40 Live-Bestaetigung dokumentiert.
- Browser-Befund dokumentiert:
  - Admin -> Admin-Notizen zeigt 3 Notizen.
  - Button "Neue Notiz" ist sichtbar.
  - Create funktioniert.
  - Liste aktualisiert sich nach Create automatisch.
  - Keine Update-/Deactivate-/Delete-Buttons sichtbar.
- RDAP40 Testnotiz dokumentiert:
  - `admin_note_20260625171342_d1f871dd6370`
  - Zieluser `tw:127709954`
  - Status `active`
  - Text `—test`
- Routes-Status nach RDAP40 dokumentiert.
- Bekannte Semantik-Unsauberkeit dokumentiert:
  - `adminNoteWriteConfirmed.uiWriteButtonsEnabled: false` stammt aus RDAP39 und ist nach RDAP40 ungenau.
- Projektstatus, TODO, NEXT_STEPS und FILES aktualisiert.
- Neuen Next-Chat-Prompt erstellt:
  - `docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP40B.md`
- Keine Code-Aenderung.
- Kein Webserver-Deploy noetig.

## RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED - 2026-06-25

- Admin-Notizen-UI um Create-Dialog/Button erweitert.
- Create-Button nur sichtbar, wenn Schreibrecht serverseitig erkannt wird.
- POST nutzt bestehende RDAP39-Route:
  - `/api/remote/admin/users/admin-notes/create`
- Body-confirmWrite bleibt Pflicht.
- Nach erfolgreichem Create wird die Liste ueber RDAP39C-Readback neu geladen.
- Kein Update.
- Kein Deactivate.
- Kein Delete.
- Keine Community-Seiten-Anbindung.
- Keine Permission-Vergabe in der UI.

## RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC - 2026-06-25

- Fehlende echte Admin-Note-Read-Route im Repo wiederhergestellt/synchronisiert.
- Service eingebunden:
  - `admin-user-admin-note-real-read-authed.service.js`
- Route registriert:
  - `GET /api/remote/admin/users/admin-notes/read`
- `/api/remote/routes` um `adminNoteReadRestored` erweitert.
- Keine Writes geaendert.
- Create-Route unveraendert.
- Update/Deactivate/Delete bleiben deaktiviert.

## RDAP39B_ADMIN_NOTE_WRITE_BACKEND_LIVE_CONFIRMED_DOCS - 2026-06-25

- RDAP39 Live-Bestaetigung dokumentiert.
- Ersten produktiven kontrollierten Backend-Create-Write fuer Admin-Benutzernotizen dokumentiert.
- Erstellte Testnotiz dokumentiert:
  - `admin_note_20260625104920_5fec9726d7a3`
  - Zieluser `tw:127709954`
  - Status `active`
- Audit-Readback dokumentiert:
  - Attempt: `rdap39_admin_note_attempt_20260625104920_d3bf635c6d4e`
  - Success: `rdap39_admin_note_success_20260625104920_9047246cdad5`
- Lock-Readback dokumentiert:
  - `rdap39_admin_note_lock_20260625104920_b185f1071a74`
  - Status `released`
- Live-Permission-Ergaenzung dokumentiert:
  - `remote.view`
  - `admin.users.note.read`
  - `admin.users.note.write`
  - `owner -> admin.users.note.write -> allow`
- Dokumentiert, dass `dashboard_locks` keine Spalte `released_at` besitzt.
- Projektstatus, TODO, NEXT_STEPS und FILES aktualisiert.
- Keine Code-Aenderung.
- Kein Webserver-Deploy noetig.

## RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED - 2026-06-25

- Kontrollierten Backend-Create-Write fuer Admin-Notizen vorbereitet.
- Route:
  - `POST /api/remote/admin/users/admin-notes/create`
- Aktiviert nur Create.
- Update bleibt deaktiviert.
- Deactivate bleibt deaktiviert.
- UI-Schreibbuttons bleiben deaktiviert.
- Physisches Delete bleibt verboten.
- Write nur mit gueltiger Session, Dashboard-Zugriff, Permission, Body-confirmWrite, Lock, Audit und Readback.
- Raw `note_text` wird nicht im Audit gespeichert.

## RDAP38B_ADMIN_NOTE_WRITE_PLAN_LIVE_CONFIRMED_DOCS - 2026-06-25

- RDAP38 Planroute live bestaetigt und dokumentiert.
- `/api/remote/admin/users/admin-notes/write-plan` dokumentiert.
- Kein produktiver Write in RDAP38.

## RDAP37B_ADMIN_LOCK_TEST_LIVE_CONFIRMED_DOCS - 2026-06-25

- Lock Acquire/Heartbeat/Release live bestaetigt und dokumentiert.
- `dashboard_locks` Test-Lock released bestaetigt.

## RDAP36B_ADMIN_AUDIT_TEST_INSERT_LIVE_CONFIRMED_DOCS - 2026-06-25

- Audit-Testinsert live bestaetigt und dokumentiert.
- Zwei RDAP36-Testeintraege in `dashboard_audit_log` dokumentiert.
