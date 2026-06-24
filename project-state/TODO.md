# TODO - stream-control-center

Stand: RDAP13_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_PLAN
Datum: 2026-06-24

## Erledigt

- [x] RDAP9 Lock-/Audit-Konzept fuer spaetere Writes dokumentiert
- [x] RDAP10 Lock-/Audit-Implementierungsplan read-only dokumentiert
- [x] RDAP11 Lock-/Audit read-only Skeleton vorbereitet
- [x] RDAP11B Lock-/Audit read-only Skeleton live deployed und getestet
- [x] RDAP11C Live-Test dokumentiert
- [x] RDAP12 Schema-Kompatibilitaetsplan dokumentiert
- [x] RDAP13 Schema-Adapter read-only Plan dokumentiert

## Noch offen / als naechstes

- [ ] RDAP14 Lock-/Audit Schema-Adapter read-only Skeleton bauen
- [ ] Adapter-Diagnose live read-only testen
- [ ] Step-Scripte spaeter so verbessern, dass `remote-modboard/` sauber erkannt/committed wird
- [ ] Server-Deploy-Scripts mit Readiness-Wait/Retry standardisieren

## Dauerhafte Verbote bis eigener Scope

- [ ] Kein Login aktivieren
- [ ] Kein OAuth aktivieren
- [ ] Keine Cookies setzen
- [ ] Keine Sessions erstellen
- [ ] Keine produktiven DB-Writes
- [ ] Keine Migration ohne Backup/Rollback/Go
- [ ] Keine Remote-Writes
- [ ] Keine Agent-Actions
- [ ] Keine Secrets ins Repo, Frontend, Logs oder Chat
