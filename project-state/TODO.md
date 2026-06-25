# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS17B_ROUTE_LIST_SYNC_LIVE_CONFIRMED  
Datum: 2026-06-25

## RDAP / Remote-Modboard

- [x] RDAP12 First-Mini-Write-Scope-Plan erstellt.
- [x] RDAP13 Admin-Notiz-Table/Disabled-Route-Plan erstellt.
- [x] RDAP14 Admin-Notiz-Table-Diagnose gebaut.
- [x] RDAP14 Admin-Notiz-Table-Diagnose live bestaetigt.
- [x] RDAP14B Routenuebersicht fuer `adminUserAdminNoteDiagnostic` synchronisiert.
- [x] RDAP14B Webserver-Deploy live bestaetigt.
- [x] RDAP15 Admin-Notiz-Tabellen-Migration geplant.
- [x] RDAP16 SQL-Datei und Migrationsanleitung bereitgestellt.
- [x] RDAP16 lokal eingespielt und stepdone ausgefuehrt.
- [x] RDAP16 auf Webserver deployed.
- [x] RDAP16 DB-Kontext eindeutig geklaert.
- [x] RDAP16 Backup erstellt und Backup-Datei geprueft.
- [x] RDAP16 Read-only SQL-Vorpruefung ausgefuehrt.
- [x] RDAP16 `dashboard_user_admin_notes` manuell migriert.
- [x] RDAP16 Read-Back nach Migration geprueft.
- [x] RDAP16 Diagnose geprueft: `schemaReady: true`, Writes weiterhin disabled.
- [x] RDAP17 Admin-Notiz Read-Diagnostic read-only gebaut.
- [x] RDAP17 Admin-Notiz Read-Diagnostic live bestaetigt.
- [x] RDAP17B Routenuebersicht fuer Admin-Notiz Read-Diagnostic synchronisiert.
- [x] RDAP17B Webserver-Deploy live bestaetigt.

## Weiterhin offen

- [ ] RDAP18 Admin-Notiz Display-Scope planen.
- [ ] Noch keine produktive Admin-Notiz-Anzeige mit Notiztexten bauen, bevor Auth/Permission geklaert ist.
- [ ] Noch keinen Admin-Notiz-Write bauen.
- [ ] Noch keine UI-Schreibbuttons.
- [ ] Permission `admin.users.note.read` fuer spaetere Anzeige klaeren.
- [ ] Permission `admin.users.note.write` fuer spaeteren Write klaeren.
- [ ] Confirm-Write Pflicht fuer spaeteren Admin-Notiz-Write vorbereiten.
- [ ] Audit-Payload fuer spaeteren Admin-Notiz-Write vorbereiten.
- [ ] Lock-Scope fuer spaeteren Admin-Notiz-Write vorbereiten.
- [ ] OAuth-Safety-Check im Deploy-Script separat pruefen: `twitch/start` liefert aktuell 302 statt erwarteter 403.

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
- [ ] Bei RDAP unterscheiden: Repo-Root, Deploy-Clone und Live-Ordner `/remote-modboard` sind nicht dasselbe.
