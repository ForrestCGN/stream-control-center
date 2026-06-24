# TODO - stream-control-center

Stand: RDAP16_HANDOFF_VISIBLE_NEXT
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
- [x] RDAP15 Lock resourceType Decision Plan dokumentiert
- [x] RDAP16 Handoff Visible Next vorbereitet

## Als nächstes

- [ ] RDAP_UI1 Remote-Modboard erste sichtbare read-only UI-Seite planen
- [ ] echte Frontend-/htdocs-/remote-modboard-Struktur prüfen
- [ ] vorhandene Module nutzen statt neue Modulflut
- [ ] UI nur read-only Diagnose anzeigen lassen
- [ ] keine Login-/OAuth-/Write-/Agent-Aktivierung

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
