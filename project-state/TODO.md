# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION  
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
- [x] Admin -> User & Rollen read-only Übersicht gebaut
- [x] Topbar-Ausloggen entfernt, Logout bleibt im Profilpanel
- [x] Profilpanel-Aktionen auf `Profil aktualisieren` und `Ausloggen` reduziert
- [x] `RDAP_ADMIN_USERS2_MANAGEMENT_PLAN` dokumentiert
- [x] `RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN` dokumentiert
- [x] `RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION` dokumentiert

## Offen / direkt

- [ ] `RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION.zip` lokal einspielen
- [ ] `git status` prüfen
- [ ] `stepdone.cmd` ausführen
- [ ] Secrets rotieren, falls noch nicht erledigt:
  - [ ] `SESSION_SECRET`
  - [ ] `OAUTH_STATE_SECRET`
- [ ] Browser-Login nach Secret-Rotation prüfen

## Nächste Planung / kleiner Code-Step

- [ ] `RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC` planen
- [ ] vorhandene Auth-/Permission-/Read-Services prüfen
- [ ] Permission-Read/Diagnose für Owner/Admin/normalen User vorbereiten
- [ ] keine produktiven Admin-Writes bauen

## Später mit eigenem Write-Scope

- [ ] User freigeben/sperren
- [ ] Rollen vergeben/entziehen
- [ ] Gruppen/Freigaben setzen/entfernen
- [ ] Sound-Profi setzen/entfernen
- [ ] Sessions widerrufen
- [ ] Audit-Verlauf für Adminaktionen
- [ ] Locks/Confirm/Audit für alle Admin-Writes
- [ ] Backup/Rollback vor jedem produktiven DB-Write-Step

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
