# TODO

Stand: RDAP31_ADMIN_NOTE_WRITE_BACKEND_DISABLED_UI  
Datum: 2026-06-25

## Offen

- [ ] RDAP31 lokal einspielen, `node --check` ausfuehren, stepdone.
- [ ] RDAP31 nach GitHub/dev vom Webserver aus frischem Clone deployen.
- [ ] Webserver-Service neu starten und Readiness abwarten.
- [ ] `/api/remote/routes` pruefen.
- [ ] RDAP31 POST-Routen pruefen:
  - ohne Confirm -> 400
  - mit Confirm ohne Write-Permission -> 403
  - keine DB-Aenderung
- [ ] RDAP32 Audit-/Lock-Write echte Grundlage planen/bauen.
- [ ] Erst danach `admin.users.note.write` vergeben.
- [ ] Erst danach produktive Admin-Notiz-Writes aktivieren.
- [ ] UI-Schreibbuttons erst nach Backend-Erfolg separat freischalten.

## Erledigt

- [x] RDAP25 Login/OAuth/Session.
- [x] RDAP26 Rollen/Permissions Option B.
- [x] RDAP27 echte read-only Admin-Notiztext-Route.
- [x] RDAP28 read-only Admin-Notiz-UI.
- [x] RDAP29/RDAP29B MariaDB-Testnotiz live sichtbar.
- [x] RDAP30 Write-Scope geplant.
- [x] RDAP31 gesperrte Write-Validierungsrouten vorbereitet.
