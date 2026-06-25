# TODO - stream-control-center

Stand: RDAP29B_ADMIN_NOTE_MARIADB_SEED_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## RDAP / Remote-Modboard

- [x] RDAP25 Login/OAuth/Session bestaetigt.
- [x] RDAP26 Option B DB-Rollen/Permissions bestaetigt.
- [x] RDAP27 echte read-only Admin-Notiztext-Route live bestaetigt.
- [x] RDAP28 read-only Admin-Notiz-UI live bestaetigt.
- [x] RDAP29 Admin-Notiz Test-Seed lokal vorbereitet und nach GitHub/dev uebernommen.
- [x] RDAP29 Live-DB als MariaDB bestaetigt, nicht SQLite.
- [x] RDAP29 echte Tabelle `dashboard_user_admin_notes` bestaetigt.
- [x] RDAP29 ForrestCGN User `tw:127709954` in `dashboard_users`/`dashboard_identities` bestaetigt.
- [x] RDAP29 kontrollierte Testnotiz in `dashboard_user_admin_notes` eingefuegt.
- [x] RDAP29 Browser-Test bestaetigt: 1 Admin-Notiz read-only sichtbar.
- [x] RDAP29B Doku-/Projektstatus-Korrektur erstellt.

## Noch pruefen / nachziehen

- [ ] Backup-Datei unter `/opt/stream-control-center/_db_backups` pruefen.
- [ ] Falls kein valides Backup vorhanden ist: `dashboard_user_admin_notes` nachtraeglich per `mysqldump` sichern.
- [ ] RDAP29B lokal einspielen und `stepdone.cmd` ausfuehren.

## Naechster Fach-Step

- [ ] RDAP30 Admin-Notiz Write-Scope planen.
- [ ] Rollen-/Rechteentscheidung fuer `admin.users.note.write` treffen.
- [ ] Confirm-Write-Pflicht fuer spaeteren Admin-Notiz-Write definieren.
- [ ] Audit-Payload fuer spaeteren Admin-Notiz-Write definieren.
- [ ] Lock-Scope fuer spaeteren Admin-Notiz-Write definieren.
- [ ] Read-Back-Pruefung nach spaeterem Write definieren.
- [ ] Fehler-/Abbruchfaelle fuer Write definieren.
- [ ] UI-Regeln fuer Schreibbuttons planen.

## Weiterhin verboten ohne separaten Fachstep

- [ ] Admin-Notiz schreiben/aendern/loeschen ueber UI oder API aktivieren.
- [ ] Permission `admin.users.note.write` vergeben.
- [ ] UI-Schreibbuttons anzeigen.
- [ ] User freigeben/sperren.
- [ ] Rollen vergeben/entziehen.
- [ ] Gruppen/Freigaben setzen/entfernen.
- [ ] Sessions widerrufen.
- [ ] Audit-/Lock-Writes produktiv ausfuehren.
- [ ] Agent-/OBS-/Sound-/Overlay-/Command-Steuerung aktivieren.

## Community-Seite / forrestcgn.de / .info

- [ ] Zentrale User-/Auth-/Rollen-Basis so planen, dass spaeter Community-Seite und Modboard dieselbe stabile User-ID nutzen koennen.
- [ ] Community-Profile/Inhalte strikt von Dashboard-/Security-/Admin-Daten trennen.
- [ ] Dashboard-Link auf Community-Seite spaeter serverseitig ueber Rollen/Rechte entscheiden, nicht ueber Community-Profilfelder.
- [ ] Admin-Notizen niemals oeffentlich ueber Community-Seiten sichtbar machen.

## Workflow-Schutz

- [ ] Workflow-Tools nicht in Fach-/Frontend-/Diagnose-Steps ueberschreiben.
- [ ] Fehlende Dateien gezielt anfordern; nicht raten.
- [ ] ZIPs immer mit echten Zielpfaden bauen, ohne extra Oberordner.
- [ ] Doku-only Steps nicht als Webserver-Service-Deploy behandeln.
