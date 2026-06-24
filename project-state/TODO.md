# TODO - stream-control-center

Stand: RDAP_AUTH4_SELF_TWITCH_PROFILE_SYNC
Datum: 2026-06-24

## Erledigt

- [x] Remote-Modboard auf `mods.forrestcgn.de` live
- [x] Twitch OAuth Start aktiviert
- [x] Twitch Login live erfolgreich
- [x] Auth/OAuth/Sessions aktiv
- [x] Dashboard Access-Gate aktiv
- [x] ForrestCGN freigeschaltet
- [x] EngelCGN kann per Allowlist zum Testen freigeschaltet werden
- [x] RDAP-Webserver-Deploy-Arbeitsweise korrigiert und dokumentiert
- [x] Dashboard-v2/V13-Designbasis portiert
- [x] Login-/Denied-Seite zentriert
- [x] Grid-/Spacing-Fehler korrigiert
- [x] Self-Profilpanel oben rechts eingebaut
- [x] Twitch-Avatar-Spalten in DB angelegt
- [x] Avatar oben rechts sichtbar
- [x] Self-Service `Profil aktualisieren` eingebaut und bestätigt

## Offen

- [ ] `RDAP_AUTH4_DOCS_FINALIZE` lokal einspielen und per `stepdone.cmd` abschließen
- [ ] `SESSION_SECRET` rotieren, falls noch nicht erledigt
- [ ] `OAUTH_STATE_SECRET` rotieren, falls noch nicht erledigt
- [ ] Browser-Login nach Secret-Rotation prüfen

## Nächste Planung

- [ ] `RDAP_ADMIN_USERS1_READONLY_OVERVIEW` planen/bauen
- [ ] Admin-Bereich für User-/Rollenübersicht read-only vorbereiten
- [ ] Trennung beachten: Self-Funktionen oben rechts, Admin-Verwaltung unter Admin

## Später mit eigenem Write-Scope

- [ ] User freigeben/sperren
- [ ] Rollen vergeben/entziehen
- [ ] Sound-Profi setzen/entfernen
- [ ] Sessions widerrufen
- [ ] Audit-Verlauf für Adminaktionen
- [ ] Locks/Confirm/Audit für alle Admin-Writes

## Weiterhin verboten bis eigener Scope

- [ ] Keine Remote-Writes außerhalb freigegebener Auth-/Self-Profil-Funktion
- [ ] Keine Agent-Actions
- [ ] Keine OBS-Steuerung
- [ ] Keine Sound-Steuerung
- [ ] Keine Overlay-Steuerung
- [ ] Keine Command-Steuerung
- [ ] Keine Migration ohne Backup/Rollback/Go
- [ ] Keine Secrets ins Repo/Frontend/Chat/Logs
- [ ] Keine Funktionalität entfernen
