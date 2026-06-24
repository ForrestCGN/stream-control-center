# TODO - stream-control-center

Stand: RDAP_UI1_LIVE_CONFIRMED
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
- [x] RDAP_UI1 Remote-Modboard erste sichtbare read-only UI-Seite geplant
- [x] RDAP_UI1 echte Frontend-/htdocs-/remote-modboard-Struktur geprüft
- [x] RDAP_UI1 vorhandenes Remote-Modboard-Backend erweitert statt neues Modul gebaut
- [x] RDAP_UI1 UI nur read-only Diagnose anzeigen lassen
- [x] RDAP_UI1 keine Login-/OAuth-/Write-/Agent-Aktivierung
- [x] RDAP_UI1 live unter `https://mods.forrestcgn.de/` sichtbar getestet
- [x] RDAP_UI1 SSL/Let's Encrypt für `mods.forrestcgn.de` bestätigt
- [x] RDAP_UI1 OAuth Start/Callback bleiben HTTP 403

## Als nächstes

- [ ] RDAP Deploy-Runbook oder Server-Deploy-Script für Remote-Modboard erstellen/dokumentieren
- [ ] Festhalten: `/opt/stream-control-center` ist kein Git-Repo
- [ ] Festhalten: Deploy läuft über GitHub/dev Clone nach `_deploy_tmp` und `rsync` nach `remote-modboard`
- [ ] Danach UI2 read-only Komfort planen

## Dauerhafte Verbote bis eigener Scope

- [ ] Kein Login aktivieren
- [ ] Kein OAuth aktivieren
- [ ] Keine Cookies setzen
- [ ] Keine Sessions erstellen
- [ ] Keine produktiven DB-Writes
- [ ] Keine Migration ohne Backup/Rollback/Go
- [ ] Keine Remote-Writes
- [ ] Keine Agent-Actions
- [ ] Keine OBS-/Sound-/Overlay-/Command-Steuerung
- [ ] Keine Secrets ins Repo, Frontend, Logs oder Chat
