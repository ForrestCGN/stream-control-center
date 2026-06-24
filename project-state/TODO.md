# TODO - stream-control-center

Stand: RDAP_DESIGN1C_TRUE_V13_PORT / RDAP_DESIGN1C_DOCS_FINALIZE
Datum: 2026-06-24

## Erledigt

- [x] Remote-Modboard auf `mods.forrestcgn.de` live
- [x] Twitch OAuth Start aktiviert
- [x] Twitch Login live erfolgreich
- [x] Browser zeigte `Angemeldet als ForrestCGN`
- [x] Auth/OAuth/Sessions aktiv
- [x] RDAP-Webserver-Deploy-Arbeitsweise korrigiert und dokumentiert
- [x] Ersten RDAP-Designstand gebaut
- [x] Layoutproblem aus erstem Designstand erkannt: Navigation zu groß / falsche Content-Wirkung
- [x] `RDAP_DESIGN1B_LAYOUT_FIX` vorbereitet
- [x] `RDAP_DESIGN1C_TRUE_V13_PORT` als echter Dashboard-v2/V13-Port gebaut und von Forrest als fertiger Designstand bestätigt
- [x] `RDAP_DESIGN1C_DOCS_FINALIZE` vorbereitet, um Design1C sauber zu dokumentieren

## Sofort offen

- [ ] `SESSION_SECRET` rotieren, falls noch nicht erledigt
- [ ] `OAUTH_STATE_SECRET` rotieren, falls noch nicht erledigt
- [ ] Service nach Rotation neu starten
- [ ] Browser-Login nach Rotation prüfen
- [ ] EngelCGN-Zugriff prüfen, wenn sie testen soll

## Design offen

- [ ] Künftige RDAP-UI-Erweiterungen auf `RDAP_DESIGN1C_TRUE_V13_PORT` aufbauen
- [ ] Nicht wieder auf ältere Design1/Design1B-Zwischenstände zurückfallen
- [ ] Designbasis `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE` als aktuelle RDAP-Designrichtung beibehalten

## Auth/Access offen

- [ ] Zentralen Hauptseiten-Login als Zielarchitektur weiter planen
- [ ] Login-Einstieg über `forrestcgn.de` und `mods.forrestcgn.de` ermöglichen
- [ ] Gemeinsame zentrale Auth-/Session-Schicht vorbereiten
- [ ] Gemeinsame serverseitige DB-Wahrheit für User/Identities/Sessions nutzen
- [ ] `mods.forrestcgn.de` soll später Login übernehmen/pruefen können
- [ ] Access-Denied sauber halten
- [ ] Rollen/Rechte für Owner/Streamer/Mods/Sound-Profi planen
- [ ] `RDAP_PERMISSIONS1_ROLE_ALLOWLIST_UI` planen/bauen

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
