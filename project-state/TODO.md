# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN  
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [x] RDAP7B Confirm-Metadata-Cleanup remote bestätigt.
- [x] RDAP8 Audit-Helper disabled remote bestätigt.
- [x] RDAP9 Lock-Helper disabled remote bestätigt.
- [x] RDAP10 Backup-/Rollback-/Mini-Write-Plan erstellt.
- [x] RDAP10B Projektstatus-Dateien auf RDAP10-Planstand synchronisiert.
- [x] RDAP11 Mini-Write-Foundation disabled gebaut.
- [x] RDAP11 Webserver-Deploy remote bestätigt.
- [x] RDAP DESIGN2 Login Text Polish lokal und live bestätigt.
- [x] RDAP Account Panel Cleanup V2: Konto-Panel enttechnisiert.
- [x] RDAP Nav Cleanup: Benutzerbereich aus Sidebar entfernt und ins Profil/Admin-Konzept verschoben.
- [x] RDAP Nav/Account Cleanup dokumentiert.
- [x] RDAP12 First-Mini-Write-Scope-Plan erstellt.
- [x] RDAP13 Admin-Note-Table/Disabled-Route-Plan erstellt.
- [ ] RDAP14 Admin-Note-Table Disabled Diagnostic vorbereiten.
- [ ] Noch keine produktiven Admin-Writes ohne separaten Scope/Go.
- [ ] Noch keine UI-Schreibbuttons.
- [ ] Noch keine DB-Migration ohne Backup/Rollback/Go.
- [ ] Auffälligkeit prüfen: `statusApiVersion` zeigt evtl. `rdap_admin_users9.v1`, obwohl `moduleBuild` RDAP11 ist.

## RDAP14 muss klären/bauen

- [ ] Echten Ziel-DB-Typ auf Server prüfen, nicht raten.
- [ ] SQL-Migrationsdatei für `dashboard_user_admin_notes` vorbereiten, nicht ausführen.
- [ ] Read-only/disabled Diagnose-Route für Admin-Notiz-Write vorbereiten.
- [ ] Route muss `productiveWritesEnabled:false` und `writesStillBlocked:true` melden.
- [ ] Keine UI-Schreibbuttons.
- [ ] Keine produktiven Notiz-Writes.

## Admin-Notiz späterer Write

- [x] Kleinsten späteren Write ausgewählt: Admin-Notiz zu User setzen/aktualisieren.
- [x] Eigene Tabelle `dashboard_user_admin_notes` geplant.
- [x] Permission `admin.users.note.write` geplant.
- [x] Confirm-Write-Anforderung geplant.
- [x] Audit-Payload geplant.
- [x] Lock-Scope `admin:user-note:<target_user_uid>` geplant.
- [x] Read-Back-Prüfung geplant.
- [x] Fehlerfälle/Abbruchbedingungen dokumentiert.
- [ ] Echter Write-Endpunkt erst nach RDAP14/weiterem Go.

## Workflow-Schutz

- [ ] Vor jedem weiteren Step `installstep.cmd`, `stepdone.cmd`, `testdeploy.cmd` und `tools/remote-modboard-deploy.sh` als geschützte Workflow-Tools behandeln.
- [ ] Design-/Frontend-/Doku-Steps dürfen Workflow-Tools nicht überschreiben.
- [ ] ZIPs immer mit echten Zielpfaden bauen; keine Patch-Skripte unter `tools/steps/*.ps1`.
- [ ] Fehlende Dateien gezielt anfordern; nicht raten.

## Geparkt: Lokal/LAN

- [ ] `RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN`
- [ ] Lokaler Betrieb im Heimnetz.
- [ ] EngelCGN soll lokal im LAN arbeiten können.
- [ ] Lokaler Login ebenfalls über Twitch.
- [ ] Keine lokalen Bypass-Rechte ohne Login.
- [ ] Keine Secrets ins Repo.
