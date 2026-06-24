# TODO - stream-control-center

Stand: RDAP_HANDOFF_AUTH_DASHBOARD2_STOCKT
Datum: 2026-06-24

## Erledigt

- [x] Remote-Modboard auf `mods.forrestcgn.de` live
- [x] Deploy-Script live getestet
- [x] UI1 sichtbar
- [x] UI2 Read-only Komfort sichtbar
- [x] Twitch OAuth Start aktiviert
- [x] Twitch Login live erfolgreich
- [x] Browser zeigte `Angemeldet als ForrestCGN`
- [x] Auth/OAuth/Sessions aktiv

## Sofort offen

- [ ] `SESSION_SECRET` rotieren
- [ ] `OAUTH_STATE_SECRET` rotieren
- [ ] Service nach Rotation neu starten
- [ ] Browser-Login nach Rotation prüfen
- [ ] Aktuellen Dashboard2-Stand im Repo prüfen

## Design offen

- [ ] Echte CGN-/Vision-UI-/Neon-Galaxy-Designbasis aus Repo finden
- [ ] Nicht weiter frei CSS/HTML improvisieren
- [ ] `RDAP_DESIGN1_REAL_CGN_BASE` planen/bauen

## Auth/Access offen

- [ ] Zentralen Hauptseiten-Login als Zielarchitektur planen
- [ ] `mods.forrestcgn.de` soll später Login übernehmen können
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
