# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS2_MANAGEMENT_PLAN  
Datum: 2026-06-24

## Erledigt

- [x] Remote-Modboard auf `mods.forrestcgn.de` live
- [x] Twitch OAuth Start aktiviert
- [x] Twitch Login live erfolgreich
- [x] Auth/OAuth/Sessions aktiv
- [x] Dashboard Access-Gate aktiv
- [x] ForrestCGN freigeschaltet
- [x] EngelCGN als Test-User sichtbar bzw. für Tests vorgesehen
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
- [x] `RDAP_ADMIN_USERS2_MANAGEMENT_PLAN` erstellt
- [x] Admin-Userverwaltung als späterer Write-Scope geplant, nicht gebaut

## Offen / direkt

- [ ] `RDAP_ADMIN_USERS2_MANAGEMENT_PLAN.zip` lokal einspielen
- [ ] Prüfen, dass nur Doku-/Projektstatus-Dateien geändert wurden
- [ ] `stepdone.cmd` ausführen
- [ ] Optional Webserver-Deploy durchführen
- [ ] Browser-Test auf `https://mods.forrestcgn.de/`, falls deployt
- [ ] `SESSION_SECRET` rotieren, falls noch nicht erledigt
- [ ] `OAUTH_STATE_SECRET` rotieren, falls noch nicht erledigt
- [ ] Browser-Login nach Secret-Rotation prüfen

## Nächste Planung

- [ ] `RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN_OR_BACKUP_SCOPE` planen
- [ ] echten DB-/Tabellenstand für Admin-Userverwaltung prüfen
- [ ] vorhandene Permission-/Audit-/Locking-Services prüfen
- [ ] Backup-/Rollback konkret planen
- [ ] kleinsten sicheren Admin-Write-Scope definieren

## Später mit eigenem Write-Scope

- [ ] User freigeben/sperren
- [ ] Rollen vergeben/entziehen
- [ ] Gruppen/Freigaben vergeben/entziehen
- [ ] Sound-Profi setzen/entfernen
- [ ] Sessions widerrufen
- [ ] Audit-Verlauf für Adminaktionen anzeigen
- [ ] Locks/Confirm/Audit für alle Admin-Writes
- [ ] Rechte-Diagnose pro User anzeigen

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
