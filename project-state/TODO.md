# TODO

Stand: RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED  
Datum: 2026-06-26

## Erledigt

- [x] RDAP36 Audit-Testinsert live bestaetigt.
- [x] RDAP37 Lock Acquire/Heartbeat/Release live bestaetigt.
- [x] RDAP38 Admin-Note-Write-Planroute live bestaetigt.
- [x] RDAP39 Backend-Create-Write fuer Admin-Notizen gebaut und live bestaetigt.
- [x] RDAP39C Admin-Note Read-Route wiederhergestellt/synchronisiert und live bestaetigt.
- [x] RDAP40 Admin-Note Create-UI gebaut und live bestaetigt.
- [x] RDAP42 Status-/Routes-Semantik bereinigt und live bestaetigt.
- [x] RDAP43 Zieluser-Auswahl/Admin-User-Detail fuer Admin-Notizen geplant.
- [x] RDAP44 Admin-Notizen-UI mit Zieluser-Auswahl umgesetzt und live bestaetigt.
- [x] RDAP45B Deploy-Safety fuer aktiv genutzten Login korrigiert.
- [x] RDAP45C Live-Bestaetigung Login/Deploy-Safety dokumentiert.
- [x] RDAP46 naechsten kleinen Admin-Notizen-Step geplant.
- [x] RDAP47 Zieluser-Suche/Filter fuer Admin-Notizen vorbereitet.

## Offen / Naechstes

- [ ] RDAP47 lokal per `installstep.cmd` einspielen.
- [ ] RDAP47 `node --check` fuer `rdap28-admin-notes.js` ausfuehren.
- [ ] RDAP47 per `stepdone.cmd` nach GitHub/dev bringen.
- [ ] RDAP47 Webserver-Deploy aus frischem GitHub/dev-Clone ausfuehren.
- [ ] Live bestaetigen: Zieluser-Suche sichtbar.
- [ ] Live bestaetigen: Suche nach `forrestcgn` findet ForrestCGN / `tw:127709954`.
- [ ] Live bestaetigen: Read/Create nutzen weiterhin ausgewaehlten Zieluser.
- [ ] Danach RDAP47B Live-Bestaetigung dokumentieren.
- [ ] Admin-Note Update/Deactivate nur als separater geplanter Step mit Audit/Lock/Backup/Confirm.
- [ ] Permission-Verwaltung in der UI separat planen, nicht mit Admin-Notizen vermischen.
- [ ] Community-Seiten duerfen Admin-Notizen weiterhin nicht lesen.
- [ ] Spaeter echte Admin-User-Detailseite read-only planen.
