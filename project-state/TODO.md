# TODO

Stand: RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED  
Datum: 2026-06-26

## Erledigt

- [x] RDAP36 Audit-Testinsert live bestaetigt.
- [x] RDAP37 Lock Acquire/Heartbeat/Release live bestaetigt.
- [x] RDAP38 Admin-Note-Write-Planroute live bestaetigt.
- [x] RDAP39 Backend-Create-Write fuer Admin-Notizen gebaut und live bestaetigt.
- [x] RDAP39C Admin-Note Read-Route wiederhergestellt/synchronisiert und live bestaetigt.
- [x] RDAP40 Admin-Note Create-UI gebaut und live bestaetigt.
- [x] RDAP42 Status-/Routes-Semantik bereinigt und live bestaetigt.
- [x] RDAP44 Admin-Notizen-UI mit Zieluser-Auswahl umgesetzt und live bestaetigt.
- [x] RDAP45B Deploy-Safety fuer aktiv genutzten Login korrigiert.
- [x] RDAP45C Live-Bestaetigung Login/Deploy-Safety dokumentiert.
- [x] RDAP47 Zieluser-Suche/Filter fuer Admin-Notizen live bestaetigt.
- [x] RDAP48 Admin-User-Detail read-only geplant.
- [x] RDAP49 Admin-User-Detail read-only vorbereitet.

## Offen / Naechstes

- [ ] RDAP49 lokal per `installstep.cmd` einspielen.
- [ ] RDAP49 `node --check` fuer `rdap28-admin-notes.js` ausfuehren.
- [ ] RDAP49 per `stepdone.cmd` nach GitHub/dev bringen.
- [ ] RDAP49 Webserver-Deploy aus frischem GitHub/dev-Clone ausfuehren.
- [ ] Live bestaetigen: Admin -> User-Detail sichtbar.
- [ ] Live bestaetigen: ForrestCGN / `tw:127709954` sichtbar.
- [ ] Live bestaetigen: Rollen/Gruppen/Sessions read-only sichtbar soweit Daten vorhanden.
- [ ] Live bestaetigen: Button Admin-Notizen oeffnet Admin-Notizen fuer denselben User.
- [ ] Danach RDAP49B Live-Bestaetigung dokumentieren.
- [ ] Admin-Note Update/Deactivate nur als separater geplanter Step mit Audit/Lock/Backup/Confirm.
- [ ] Permission-Verwaltung in der UI separat planen, nicht mit Admin-Notizen vermischen.
- [ ] Community-Seiten duerfen Admin-Notizen weiterhin nicht lesen.
