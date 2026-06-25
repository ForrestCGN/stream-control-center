# TODO

Stand: RDAP33B_ADMIN_AUDIT_LOCK_SCHEMA_STATUS_READONLY_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Offen

- [ ] RDAP33B lokal einspielen und stepdone.
- [ ] RDAP34 Audit-/Lock-Schema-Decision/Migration-Plan bauen.
- [ ] Entscheiden, ob Audit-Schema gemappt oder sanft erweitert wird.
- [ ] Keine Audit-Testwrites vor RDAP34-Entscheidung.
- [ ] Keine Admin-Notiz-Writes ohne Audit-/Lock-Foundation.
- [ ] Kein physisches Delete bauen.

## Erledigt

- [x] RDAP33 lokal gebaut.
- [x] RDAP33 nach GitHub/dev gepusht.
- [x] RDAP33 auf Webserver deployt.
- [x] RDAP33 routes/status getestet.
- [x] Audit-/Lock-Schema live read-only sichtbar.
- [x] Write-Blocker `audit_write_candidate_columns_missing` bestaetigt.
