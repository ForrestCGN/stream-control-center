# TODO - stream-control-center

Stand: RDAP28B_ADMIN_NOTE_READONLY_UI_PANEL_LIVE_CONFIRMED_DOCS  
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

## Naechstes offen

- [ ] Entscheidung im neuen Chat: Test-Notiz seed oder Write-Scope planen.
- [ ] Optional RDAP29 Admin-Notiz-Test-Seed fuer read-only Anzeige.
- [ ] Optional RDAP29 Admin-Notiz-Write-Scope-Plan.
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
- [ ] Audit-/Lock-Writes produktiv ausfuehren.
- [ ] Agent-/OBS-/Sound-/Overlay-/Command-Steuerung aktivieren.

## Workflow-Schutz

- [ ] Workflow-Tools nicht in Fach-/Frontend-/Diagnose-Steps ueberschreiben.
- [ ] Fehlende Dateien gezielt anfordern; nicht raten.
- [ ] ZIPs immer mit echten Zielpfaden bauen, ohne extra Oberordner.
- [ ] Keine unnoetigen Root-README-Dateien in ZIPs legen.
- [ ] Bei RDAP unterscheiden: Repo-Root, Deploy-Clone und Live-Ordner `/remote-modboard` sind nicht dasselbe.
- [ ] Steps so gross wie moeglich und so klein wie noetig halten.
- [ ] Nach `go` nicht denselben Befehlsklotz wiederholen, sondern naechsten sinnvollen Step liefern.
