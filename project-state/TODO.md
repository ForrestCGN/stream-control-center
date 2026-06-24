# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC_LIVE_CONFIRMED  
Datum: 2026-06-24

## RDAP / Remote-Modboard

- [x] RDAP12 First-Mini-Write-Scope-Plan erstellt.
- [x] RDAP13 Admin-Notiz-Table/Disabled-Route-Plan erstellt.
- [x] RDAP14 Admin-Notiz-Table-Diagnose gebaut.
- [x] RDAP14 Admin-Notiz-Table-Diagnose live bestätigt.
- [x] RDAP14B Routenübersicht für `adminUserAdminNoteDiagnostic` synchronisiert.
- [x] RDAP14B Webserver-Deploy live bestätigt.
- [x] Admin-Notiz-Diagnose bestätigt: Tabelle fehlt, Migration erforderlich.
- [ ] RDAP15 Admin-Notiz-Tabellen-Migration planen.
- [ ] Noch keine echte DB-Migration ohne separates Go.
- [ ] Noch keinen Admin-Notiz-Write bauen.
- [ ] Noch keine UI-Schreibbuttons.

## RDAP15 muss klären

- [ ] Exaktes SQL für `dashboard_user_admin_notes`.
- [ ] Backup-Befehl.
- [ ] Rollback-Befehl.
- [ ] Read-only Vorprüfung vor Migration.
- [ ] Read-Back-Prüfung nach Migration.
- [ ] Harte Abbruchbedingungen.
- [ ] Ob Migration weiterhin disabled vorbereitet wird oder mit separatem Go ausgeführt werden darf.

## Weiterhin verboten bis separatem Go

- [ ] User freigeben/sperren.
- [ ] Rollen vergeben/entziehen.
- [ ] Gruppen/Freigaben setzen/entfernen.
- [ ] Sessions widerrufen.
- [ ] Admin-Notiz schreiben.
- [ ] Audit-/Lock-Writes produktiv ausführen.
- [ ] Agent-/OBS-/Sound-/Overlay-/Command-Steuerung aktivieren.

## Workflow-Schutz

- [ ] Workflow-Tools nicht in Fach-/Frontend-/Diagnose-Steps überschreiben.
- [ ] Fehlende Dateien gezielt anfordern; nicht raten.
