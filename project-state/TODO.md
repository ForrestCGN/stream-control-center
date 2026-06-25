# TODO

Stand: RDAP31B_ADMIN_NOTE_WRITE_BACKEND_DISABLED_UI_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Offen

- [ ] RDAP32 Audit-/Lock-Write echte Grundlage anhand echter Dateien pruefen.
- [ ] Entscheiden, ob `confirmWrite` nur im Body erlaubt bleibt oder Query-Confirm korrigiert wird.
- [ ] Keine produktiven Admin-Notiz-Writes aktivieren, bevor Audit/Lock funktionieren.
- [ ] Erst nach Audit/Lock `admin.users.note.write` gezielt vergeben.
- [ ] Erst danach produktive Admin-Notiz-Writes aktivieren.
- [ ] UI-Schreibbuttons erst nach Backend-Erfolg separat freischalten.
- [ ] Kein physisches DELETE bauen; nur `status=inactive`.

## Erledigt

- [x] RDAP25 Login/OAuth/Session.
- [x] RDAP26 Rollen/Permissions Option B.
- [x] RDAP27 echte read-only Admin-Notiztext-Route.
- [x] RDAP28 read-only Admin-Notiz-UI.
- [x] RDAP29/RDAP29B MariaDB-Testnotiz live sichtbar.
- [x] RDAP30 Write-Scope geplant.
- [x] RDAP31 gesperrte Write-Validierungsrouten live.
- [x] RDAP31B Live-Deploy und Sicherheitschecks dokumentiert.
