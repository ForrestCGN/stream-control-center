# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS15_ADMIN_NOTE_TABLE_MIGRATION_PLAN  
Datum: 2026-06-25

## RDAP / Remote-Modboard

- [x] RDAP12 First-Mini-Write-Scope-Plan erstellt.
- [x] RDAP13 Admin-Notiz-Table/Disabled-Route-Plan erstellt.
- [x] RDAP14 Admin-Notiz-Table-Diagnose gebaut.
- [x] RDAP14 Admin-Notiz-Table-Diagnose live bestätigt.
- [x] RDAP14B Routenübersicht für `adminUserAdminNoteDiagnostic` synchronisiert.
- [x] RDAP14B Webserver-Deploy live bestätigt.
- [x] Admin-Notiz-Diagnose bestätigt: Tabelle fehlt, Migration erforderlich.
- [x] RDAP15 Admin-Notiz-Tabellen-Migration geplant.
- [x] Exaktes SQL für `dashboard_user_admin_notes` dokumentiert.
- [x] Backup-Befehl dokumentiert.
- [x] Rollback-Befehl dokumentiert.
- [x] Read-only Vorprüfung vor Migration dokumentiert.
- [x] Read-Back-Prüfung nach Migration dokumentiert.
- [x] Harte Abbruchbedingungen dokumentiert.
- [ ] Noch keine echte DB-Migration ohne separates Go.
- [ ] Noch keinen Admin-Notiz-Write bauen.
- [ ] Noch keine UI-Schreibbuttons.

## Nächster RDAP-Step

- [ ] RDAP16 Admin-Notiz-Tabelle nach separatem Go migrieren.
- [ ] Vor RDAP16 echte Server-DB-/Env-Werte prüfen.
- [ ] Vor RDAP16 Backup erstellen und Backup-Datei prüfen.
- [ ] Nach RDAP16 Diagnose prüfen: `schemaReady: true`, aber Writes weiterhin disabled.

## Community-Seite / forrestcgn.de / .info

- [ ] Zentrale User-/Auth-/Rollen-Basis so planen, dass später Community-Seite und Modboard dieselbe stabile User-ID nutzen können.
- [ ] Community-Profile/Inhalte strikt von Dashboard-/Security-/Admin-Daten trennen.
- [ ] Dashboard-Link auf Community-Seite später serverseitig über Rollen/Rechte entscheiden, nicht über Community-Profilfelder.
- [ ] Admin-Notizen niemals öffentlich über Community-Seiten sichtbar machen.
- [ ] Rollen wie Owner/Admin/Mod/Sound-Profi langfristig zentral und dashboardfähig planen.

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
