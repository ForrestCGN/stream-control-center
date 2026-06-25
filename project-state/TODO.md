# TODO

Stand: RDAP30_ADMIN_NOTE_WRITE_SCOPE_PLAN  
Datum: 2026-06-25

## Offen / naechste Arbeiten

- [ ] RDAP31 Backend-Write-Scope fuer Admin-Notizen anhand echter Dateien bauen oder final blockieren, falls Audit/Lock noch nicht produktiv bereit ist.
- [ ] Fuer Admin-Notiz-Writes `admin.users.note.write` pruefen, aber noch nicht automatisch vergeben.
- [ ] Confirm-Write fuer create/update/deactivate erzwingen.
- [ ] Audit-Events planen/umsetzen:
  - `admin.user_note.create`
  - `admin.user_note.update`
  - `admin.user_note.deactivate`
- [ ] Lock-Scope verwenden:
  - `admin.users.note:{target_user_uid}`
- [ ] Read-Back nach jedem Write erzwingen.
- [ ] Kein physisches DELETE bauen; Deaktivieren ueber `status = inactive`.
- [ ] UI-Schreibbuttons erst nach erfolgreichem Backend-Test und separatem Go sichtbar machen.
- [ ] Vor produktiven DB-Write-Steps Backup/Read-Back sichtbar pruefen.
- [ ] Lokal-/LAN-Modus spaeter wieder aufnehmen, aktuell Web-Dashboard priorisieren.

## Erledigt

- [x] RDAP25 Login/OAuth/Session.
- [x] RDAP26 Rollen/Permissions Option B.
- [x] RDAP27 echte read-only Admin-Notiztext-Route.
- [x] RDAP28 read-only Admin-Notiz-UI.
- [x] RDAP29/RDAP29B MariaDB-Testnotiz live sichtbar.
- [x] RDAP30 Write-Scope geplant.
