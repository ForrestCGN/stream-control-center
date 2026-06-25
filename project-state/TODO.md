# TODO - stream-control-center

Stand: RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION  
Datum: 2026-06-25

## RDAP / Remote-Modboard

- [x] RDAP25 Login-/OAuth-/Session-Smoke-Test erfolgreich.
- [x] RDAP26 Option B entschieden: echte Rollen/Permissions aus DB.
- [x] RDAP26 Owner-Rolle fuer ForrestCGN geseeded.
- [x] RDAP26 `owner -> remote.view -> allow` geseeded.
- [x] RDAP26 `owner -> admin.users.note.read -> allow` geseeded.
- [x] RDAP26 Browser-/API-Test bestaetigt: `effectivePermissionWouldAllow: true`.
- [x] RDAP27 echte Admin-Notiz-Read-Route mit Auth/Session/DB-Permission gebaut.
- [x] RDAP27 Webserver-Deploy live bestaetigt.
- [x] RDAP27 Sicherheitstest ohne Session: HTTP 401.
- [x] RDAP27 Browser-Test mit Session: `noteTextReturned: true`, `notes: []`, keine Writes.
- [x] RDAP28 read-only Admin-Notiz-UI-Panel gebaut.
- [x] RDAP28 Webserver-Deploy live bestaetigt.
- [x] RDAP28 Browser-Test bestaetigt: Admin -> Admin-Notizen sichtbar, Read true, Write false, Notizen 0, Tabelle true.
- [x] RDAP29 Admin-Notiz-Test-Seed fuer read-only Anzeige vorbereitet.
- [x] RDAP29 Doku fuer Backup/Vorpruefung/Seed/Read-Back vorbereitet.

## Naechstes offen

- [ ] RDAP29 lokal einspielen und pruefen.
- [ ] RDAP29 `stepdone.cmd` ausfuehren, wenn lokaler Stand sauber ist.
- [ ] RDAP29 frischen GitHub/dev-Clone auf dem Webserver erstellen.
- [ ] RDAP29 DB-Env maskiert pruefen, keine Secrets posten.
- [ ] RDAP29 DB-Backup vor Seed erstellen und Dateigroesse pruefen.
- [ ] RDAP29 Read-only Vorpruefung per INFORMATION_SCHEMA ausfuehren.
- [ ] RDAP29 SQL-Seed manuell ausfuehren.
- [ ] RDAP29 Read-Back pruefen: Test-Notiz fuer `tw:127709954` vorhanden.
- [ ] RDAP29 Browser pruefen: Admin-Notizen zeigt echten Text, Write false, keine Schreibbuttons.
- [ ] Danach RDAP30 Admin-Notiz-Write-Scope-Plan vorbereiten.
- [ ] Noch keinen Admin-Notiz-Write bauen.
- [ ] Noch keine UI-Schreibbuttons fuer Admin-Notizen.
- [ ] Permission `admin.users.note.write` fuer spaeteren Write getrennt klaeren.
- [ ] Confirm-Write Pflicht fuer spaeteren Admin-Notiz-Write vorbereiten.
- [ ] Audit-Payload fuer spaeteren Admin-Notiz-Write vorbereiten.
- [ ] Lock-Scope fuer spaeteren Admin-Notiz-Write vorbereiten.
- [ ] Deploy-Safety-Check anpassen: `302/403` bei bewusst aktivem Login erlauben.

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
- [ ] Audit-/Lock-Writes produktiv ueber Dashboard ausfuehren.
- [ ] Agent-/OBS-/Sound-/Overlay-/Command-Steuerung aktivieren.

## Workflow-Schutz

- [ ] Workflow-Tools nicht in Fach-/Frontend-/Diagnose-Steps ueberschreiben.
- [ ] Fehlende Dateien gezielt anfordern; nicht raten.
- [ ] ZIPs immer mit echten Zielpfaden bauen, ohne extra Oberordner.
- [ ] Keine unnoetigen Root-README-Dateien in ZIPs legen.
- [ ] Bei RDAP unterscheiden: Repo-Root, Deploy-Clone und Live-Ordner `/remote-modboard` sind nicht dasselbe.
- [ ] Steps so gross wie moeglich und so klein wie noetig halten.
- [ ] Nach `go` nicht denselben Befehlsklotz wiederholen, sondern naechsten sinnvollen Step liefern.
