# TODO - stream-control-center

Stand: RDAP_UI2_READONLY_COMFORT_LIVE_CONFIRMED
Datum: 2026-06-24

## Erledigt

- [x] RDAP_UI1 Remote-Modboard erste sichtbare read-only UI-Seite geplant
- [x] RDAP_UI1 vorhandenes Remote-Modboard-Backend erweitert statt neues Modul gebaut
- [x] RDAP_UI1 UI nur read-only Diagnose anzeigen lassen
- [x] RDAP_UI1 live unter `https://mods.forrestcgn.de/` sichtbar getestet
- [x] RDAP Deploy-Runbook oder Server-Deploy-Script für Remote-Modboard erstellt/dokumentiert
- [x] RDAP Deploy-Script live getestet
- [x] RDAP Deploy-Script OAuth-403-Safety bestätigt
- [x] RDAP_UI2_READONLY_COMFORT lokal vorbereitet
- [x] RDAP_UI2_READONLY_COMFORT mit `tools/remote-modboard-deploy.sh` auf Webserver deployt
- [x] UI2 im Browser unter `https://mods.forrestcgn.de/` geprüft
- [x] UI2: Auto-Refresh, letzte Aktualisierung, Schnellstatus und Read-only Hinweis sichtbar bestätigt
- [x] UI2 Live-Test dokumentiert

## Als nächstes

- [ ] RDAP_UI3_READONLY_DETAILS_OR_FILTERS planen
- [ ] Alternativ: RDAP_AUTH_LOGIN_OAUTH_PLAN separat planen, aber nicht aktivieren

## Später

- [ ] Auth/Login/OAuth separat planen, aber erst mit eigenem Scope
- [ ] Remote-Writes/Agent-Actions separat planen, aber erst mit eigenem Scope
- [ ] Rollen-/Rechtekonzept für Mods/Admins/Owner weiter planen
- [ ] Audit-Logging für spätere produktive Aktionen einplanen

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
