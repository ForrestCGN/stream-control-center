# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN  
Datum: 2026-06-24

## Erledigt

- [x] Remote-Modboard auf `mods.forrestcgn.de` live
- [x] Twitch OAuth Start aktiviert
- [x] Twitch Login live erfolgreich
- [x] Auth/OAuth/Sessions aktiv
- [x] Dashboard Access-Gate aktiv
- [x] ForrestCGN freigeschaltet
- [x] EngelCGN sichtbar/testbar
- [x] RDAP-Webserver-Deploy-Arbeitsweise korrigiert und dokumentiert
- [x] Dashboard-v2/V13-Designbasis portiert
- [x] Login-/Denied-Seite zentriert
- [x] Grid-/Spacing-Fehler korrigiert
- [x] Self-Profilpanel oben rechts eingebaut
- [x] Twitch-Avatar-Spalten in DB angelegt
- [x] Avatar oben rechts sichtbar
- [x] Self-Service `Profil aktualisieren` eingebaut und bestätigt
- [x] Admin -> User & Rollen read-only Übersicht gebaut
- [x] Topbar-Ausloggen entfernt, Logout bleibt im Profilpanel
- [x] Profilpanel-Aktionen auf `Profil aktualisieren` und `Ausloggen` reduziert
- [x] `RDAP_ADMIN_USERS2_MANAGEMENT_PLAN` abgeschlossen
- [x] Self-Profil vs. Admin-Verwaltung dokumentiert
- [x] Owner/Admin-Permission, Confirm-Write, Audit, Locking und Backup/Rollback als Pflicht dokumentiert

## Offen / direkt

- [ ] `RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN` lokal einspielen
- [ ] `git status` prüfen
- [ ] `stepdone.cmd` ausführen
- [ ] `SESSION_SECRET` rotieren, falls noch nicht erledigt
- [ ] `OAUTH_STATE_SECRET` rotieren, falls noch nicht erledigt
- [ ] Browser-Login nach Secret-Rotation prüfen

## Nächste Planung

- [ ] `RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION` planen
- [ ] echte DB-Tabellen/Spalten prüfen
- [ ] Backup-/Rollback-Scope festlegen
- [ ] Permission-Read für Owner/Admin prüfen
- [ ] Confirm-Write-Pattern technisch sauber vorbereiten
- [ ] Audit-Ziel prüfen
- [ ] Locking-Ziel prüfen

## Später mit eigenem Write-Scope

- [ ] User freigeben/sperren
- [ ] Rollen vergeben/entziehen
- [ ] Gruppen/Freigaben vergeben/entziehen
- [ ] Sound-Profi-Freigabe setzen/entfernen
- [ ] Sessions widerrufen
- [ ] Audit-Verlauf für Adminaktionen anzeigen
- [ ] Locks/Confirm/Audit für alle Admin-Writes erzwingen

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
