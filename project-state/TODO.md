# TODO - stream-control-center

Stand: RDAP14C_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_TEST_DOCS
Datum: 2026-06-24

## Erledigt

- [x] RDAP9 Lock-/Audit-Konzept fuer spaetere Writes dokumentiert
- [x] RDAP10 Lock-/Audit-Implementierungsplan read-only dokumentiert
- [x] RDAP11 Lock-/Audit read-only Skeleton vorbereitet
- [x] RDAP11B Lock-/Audit read-only Skeleton live deployed und getestet
- [x] RDAP11C Live-Test dokumentiert
- [x] RDAP12 Schema-Kompatibilitaetsplan dokumentiert
- [x] RDAP13 Schema-Adapter read-only Plan dokumentiert
- [x] RDAP14 Schema-Adapter read-only Skeleton vorbereitet
- [x] RDAP14B Schema-Adapter read-only Skeleton live deployed und getestet
- [x] RDAP14C Live-Test dokumentiert

## Noch offen / als naechstes

- [ ] RDAP15 Lock resourceType Decision Plan
- [ ] Entscheidung: resource_type Migration vs typisierter resource_key vs Hybrid
- [ ] Step-Scripte spaeter beobachten: remote-modboard sollte nach TOOLS1 automatisch mitgenommen werden
- [ ] Server-Deploy-Scripts mit Readiness-Wait/Retry weiter standardisieren

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
