# TODO - stream-control-center

Stand: RDAP_ADMIN_USERS17_ADMIN_NOTE_READ_DIAGNOSTIC  
Datum: 2026-06-25

## RDAP / Remote-Modboard

- [x] RDAP16 Admin-Notiz-Tabelle `dashboard_user_admin_notes` auf Webserver angelegt.
- [x] RDAP16 Diagnose bestätigt: `schemaReady: true`, `migrationRequired: false`, `rowCount: 0`.
- [x] RDAP17 Admin-Notiz-Read-Diagnostic vorbereitet.
- [ ] RDAP17 lokal einspielen, prüfen, stepdone, Webserver-Deploy und live testen.
- [ ] OAuth-Safety-Check 302/403 separat prüfen; nicht nebenbei in RDAP17 reparieren.
- [ ] Echte Admin-Notiz-Anzeige mit Notiztext erst nach Auth-/Permission-Plan bauen.
- [ ] Admin-Notiz-Write weiterhin nicht bauen, bis Permission, Confirm-Write, Audit, Lock und Read-Back separat geplant sind.

## Weiterhin verboten bis separatem Go

- [ ] User freigeben/sperren.
- [ ] Rollen vergeben/entziehen.
- [ ] Gruppen/Freigaben setzen/entfernen.
- [ ] Sessions widerrufen.
- [ ] Admin-Notiz schreiben.
- [ ] Audit-/Lock-Writes produktiv ausführen.
- [ ] UI-Schreibbuttons aktivieren.
- [ ] Agent-/OBS-/Sound-/Overlay-/Command-Steuerung aktivieren.

## Community-Seite / forrestcgn.de / .info

- [ ] Zentrale User-/Auth-/Rollen-Basis so planen, dass später Community-Seite und Modboard dieselbe stabile User-ID nutzen können.
- [ ] Dashboard-Link auf Community-Seite später serverseitig über Rollen/Rechte entscheiden, nicht über Community-Profilfelder.
- [ ] Admin-Notizen niemals öffentlich über Community-Seiten sichtbar machen.
