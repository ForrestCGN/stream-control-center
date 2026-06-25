# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION  
Datum: 2026-06-25

## RDAP / Remote-Modboard

- [x] RDAP12 First-Mini-Write-Scope-Plan erstellt.
- [x] RDAP13 Admin-Notiz-Table/Disabled-Route-Plan erstellt.
- [x] RDAP14 Admin-Notiz-Table-Diagnose gebaut.
- [x] RDAP14 Admin-Notiz-Table-Diagnose live bestaetigt.
- [x] RDAP14B Routenuebersicht fuer `adminUserAdminNoteDiagnostic` synchronisiert.
- [x] RDAP14B Webserver-Deploy live bestaetigt.
- [x] RDAP15 Admin-Notiz-Tabellen-Migration geplant.
- [x] RDAP16 SQL-Datei und Migrationsanleitung bereitstellen.
- [ ] RDAP16 lokal einspielen und stepdone ausfuehren.
- [ ] RDAP16 auf Webserver deployen.
- [ ] RDAP16 Readiness pruefen.
- [ ] RDAP16 Status-/Diagnose vor Migration pruefen.
- [ ] RDAP16 DB-Kontext eindeutig klaeren.
- [ ] RDAP16 Backup erstellen und Backup-Datei pruefen.
- [ ] RDAP16 Read-only SQL-Vorpruefung ausfuehren.
- [ ] RDAP16 `dashboard_user_admin_notes` manuell migrieren.
- [ ] RDAP16 Read-Back nach Migration pruefen.
- [ ] RDAP16 Diagnose pruefen: `schemaReady: true`, aber Writes weiterhin disabled.

## Weiterhin offen nach RDAP16

- [ ] Noch keinen Admin-Notiz-Write bauen, bevor Tabelle bestaetigt ist.
- [ ] Noch keine UI-Schreibbuttons.
- [ ] Permission `admin.users.note.write` sauber klaeren.
- [ ] Confirm-Write Pflicht fuer spaeteren Admin-Notiz-Write vorbereiten.
- [ ] Audit-Payload fuer spaeteren Admin-Notiz-Write vorbereiten.
- [ ] Lock-Scope fuer spaeteren Admin-Notiz-Write vorbereiten.

## Community-Seite / forrestcgn.de / .info

- [ ] Zentrale User-/Auth-/Rollen-Basis so planen, dass spaeter Community-Seite und Modboard dieselbe stabile User-ID nutzen koennen.
- [ ] Community-Profile/Inhalte strikt von Dashboard-/Security-/Admin-Daten trennen.
- [ ] Dashboard-Link auf Community-Seite spaeter serverseitig ueber Rollen/Rechte entscheiden, nicht ueber Community-Profilfelder.
- [ ] Admin-Notizen niemals oeffentlich ueber Community-Seiten sichtbar machen.
- [ ] Rollen wie Owner/Admin/Mod/Sound-Profi langfristig zentral und dashboardfaehig planen.

## Weiterhin verboten ohne separaten Fachstep

- [ ] User freigeben/sperren.
- [ ] Rollen vergeben/entziehen.
- [ ] Gruppen/Freigaben setzen/entfernen.
- [ ] Sessions widerrufen.
- [ ] Admin-Notiz schreiben.
- [ ] Audit-/Lock-Writes produktiv ausfuehren.
- [ ] Agent-/OBS-/Sound-/Overlay-/Command-Steuerung aktivieren.

## Workflow-Schutz

- [ ] Workflow-Tools nicht in Fach-/Frontend-/Diagnose-Steps ueberschreiben.
- [ ] Fehlende Dateien gezielt anfordern; nicht raten.
- [ ] ZIPs immer mit echten Zielpfaden bauen, ohne extra Oberordner.
