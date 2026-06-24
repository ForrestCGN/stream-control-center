# TODO - stream-control-center

Stand: RDAP_DESIGN1B_LAYOUT_FIX
Datum: 2026-06-24

## Erledigt

- [x] Remote-Modboard auf `mods.forrestcgn.de` live
- [x] Twitch OAuth Start aktiviert
- [x] Twitch Login live erfolgreich
- [x] Browser zeigte `Angemeldet als ForrestCGN`
- [x] Auth/OAuth/Sessions aktiv
- [x] RDAP-Webserver-Deploy-Arbeitsweise korrigiert und dokumentiert
- [x] Ersten RDAP-Designstand gebaut
- [x] Layoutproblem aus erstem Designstand erkannt: Navigation zu gross / falsche Content-Wirkung
- [x] `RDAP_DESIGN1B_LAYOUT_FIX` vorbereitet

## Sofort offen

- [ ] `RDAP_DESIGN1B_LAYOUT_FIX` lokal installieren/testen
- [ ] Wenn sauber: `stepdone.cmd`
- [ ] Danach Webserver-Deploy aus frischem GitHub/dev-Clone
- [ ] Browser-Test auf `https://mods.forrestcgn.de/`
- [ ] `SESSION_SECRET` rotieren
- [ ] `OAUTH_STATE_SECRET` rotieren
- [ ] Service nach Rotation neu starten
- [ ] Browser-Login nach Rotation prüfen

## Auth/Access offen

- [ ] Zentralen Hauptseiten-Login als Zielarchitektur planen
- [ ] Login-Einstieg über `forrestcgn.de` und `mods.forrestcgn.de` ermöglichen
- [ ] Gemeinsame zentrale Auth-/Session-Schicht vorbereiten
- [ ] Gemeinsame serverseitige DB-Wahrheit für User/Identities/Sessions nutzen
- [ ] `mods.forrestcgn.de` soll später Login übernehmen/pruefen können
- [ ] Access-Denied sauber halten
- [ ] Rollen/Rechte für Owner/Streamer/Mods/Sound-Profi planen

## Weiterhin verboten bis eigener Scope

- [ ] Keine Remote-Writes
- [ ] Keine Agent-Actions
- [ ] Keine OBS-Steuerung
- [ ] Keine Sound-Steuerung
- [ ] Keine Overlay-Steuerung
- [ ] Keine Command-Steuerung
- [ ] Keine Migration ohne Backup/Rollback/Go
- [ ] Keine Secrets ins Repo/Frontend/Chat/Logs
- [ ] Keine Funktionalität entfernen
