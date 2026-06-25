# TODO

Stand: RDAP32_ADMIN_AUDIT_LOCK_WRITE_FOUNDATION_PLAN  
Datum: 2026-06-25

## Offen

- [ ] RDAP33 Audit-/Lock-Schema-Status read-only bauen.
- [ ] Live-Schema fuer `dashboard_audit_log` pruefen.
- [ ] Live-Schema fuer `dashboard_locks` pruefen.
- [ ] Keine produktiven Admin-Notiz-Writes aktivieren, bevor Audit/Lock funktionieren.
- [ ] Entscheiden/korrigieren, ob Query-Confirm spaeter unterstuetzt werden soll.
- [ ] Body-Confirm als Standard fuer spaetere produktive Write-Tests verwenden.
- [ ] Audit-Testwrite erst nach Backup + Read-only Vorpruefung.
- [ ] Lock-Testwrite erst nach Backup + Read-only Vorpruefung.
- [ ] Kein physisches DELETE bauen; Admin-Notizen nur deaktivieren.

## Erledigt

- [x] RDAP25 Login/OAuth/Session.
- [x] RDAP26 Rollen/Permissions Option B.
- [x] RDAP27 echte read-only Admin-Notiztext-Route.
- [x] RDAP28 read-only Admin-Notiz-UI.
- [x] RDAP29/RDAP29B MariaDB-Testnotiz live sichtbar.
- [x] RDAP30 Write-Scope geplant.
- [x] RDAP31 gesperrte Write-Validierungsrouten live.
- [x] RDAP31B Live-Deploy und Sicherheitschecks dokumentiert.
- [x] RDAP32 Audit-/Lock-Write Foundation geplant.
