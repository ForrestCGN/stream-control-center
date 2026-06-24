# TODO

Stand: RDAP11_LOCK_AUDIT_READONLY_SKELETON_PREP  
Datum: 2026-06-24

## Erledigt

- [x] RDAP8B Permission Resolver Live Deploy/Test dokumentiert
- [x] RDAP9 Lock-/Audit-Konzept fuer spaetere Writes dokumentiert
- [x] RDAP10 Lock-/Audit-Implementierungsplan read-only dokumentiert
- [x] RDAP11 Lock-/Audit read-only Skeleton vorbereitet

## Noch offen / als naechstes

- [ ] RDAP11B lokal testen: `remote-modboard/backend npm run check`
- [ ] RDAP11B `git status --short` pruefen
- [ ] RDAP11B nach erfolgreichem Test `stepdone.cmd` ausfuehren
- [ ] RDAP11C Live-Deploy/Test separat planen und nur mit eigenem Go ausfuehren

## Spaeter / nicht jetzt

- [ ] Login/OAuth nur mit eigenem Security-Scope planen
- [ ] Session-Erstellung erst nach separatem Go
- [ ] Produktive Lock-Writes erst nach Login + Permission + Confirm + Audit + Backup/Rollback
- [ ] Produktive Audit-Writes erst mit eigenem Write-Scope
- [ ] Erste produktive Remote-Write-Route erst nach vollstaendigem Schutzkonzept
