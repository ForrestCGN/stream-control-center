# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS24B_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## RDAP / Remote-Modboard

- [x] RDAP12 First-Mini-Write-Scope-Plan erstellt.
- [x] RDAP13 Admin-Notiz-Table/Disabled-Route-Plan erstellt.
- [x] RDAP14 Admin-Notiz-Table-Diagnose gebaut.
- [x] RDAP14B Routenuebersicht fuer `adminUserAdminNoteDiagnostic` synchronisiert.
- [x] RDAP15 Admin-Notiz-Tabellen-Migration geplant.
- [x] RDAP16 `dashboard_user_admin_notes` manuell migriert und read-back geprueft.
- [x] RDAP17 Admin-Notiz Read-Diagnostic read-only gebaut und live bestaetigt.
- [x] RDAP17B Routenuebersicht fuer Admin-Notiz Read-Diagnostic synchronisiert.
- [x] RDAP18 Admin-Notiz Display-Scope geplant.
- [x] RDAP19 Auth-Permission-Read-Check fuer Admin-Notizen geplant.
- [x] RDAP20 Admin-Notiz Read-Permission-Diagnostic read-only gebaut.
- [x] RDAP20 Webserver-Deploy live bestaetigt.
- [x] RDAP20 unauthentifizierter Zugriff korrekt mit HTTP 401 blockiert.
- [x] RDAP21 Admin-Notiz Display-Readiness geplant.
- [x] RDAP22 echte Admin-Notiz Read-Route geplant, aber nicht gebaut.
- [x] RDAP23 Auth-/Session-/Login-Aktivierung groesser gebuendelt geplant.
- [x] RDAP24 Auth-/Session-/OAuth-Readiness-Diagnostic gebaut und live bestaetigt.
- [x] RDAP24 Readiness: `readyForLoginSmokeTest: true`, `blockers: []`.

## Weiterhin offen

- [ ] RDAP25 Auth-/Session-/OAuth Login-Smoke-Test kontrolliert durchfuehren.
- [ ] Deploy-Safety-Check anpassen: 403/403 nur bei deaktiviertem Login erwarten, 302/403 bei bewusst aktiviertem Login erlauben.
- [ ] Noch keine produktive Admin-Notiz-Anzeige mit Notiztexten bauen, bevor Auth/Session/Permission aktiv und getestet ist.
- [ ] Noch keinen Admin-Notiz-Write bauen.
- [ ] Noch keine UI-Schreibbuttons fuer Admin-Notizen.
- [ ] Permission `admin.users.note.read` fuer spaetere Anzeige serverseitig erzwingen.
- [ ] Permission `admin.users.note.write` fuer spaeteren Write getrennt klaeren.
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
- [ ] Bei RDAP unterscheiden: Repo-Root, Deploy-Clone und Live-Ordner `/remote-modboard` sind nicht dasselbe.
- [ ] Steps so gross wie moeglich und so klein wie noetig halten.
