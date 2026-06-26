# TODO

Stand: RDAP49B_ADMIN_USER_DETAIL_READONLY_LIVE_CONFIRMED_DOCS  
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
- [x] RDAP49 Webserver-Deploy aus frischem GitHub/dev-Clone ausgefuehrt.
- [x] RDAP49 live bestaetigt: Admin -> User-Detail sichtbar.
- [x] RDAP49 live bestaetigt: ForrestCGN / `tw:127709954` sichtbar.
- [x] RDAP49 live bestaetigt: Rolle owner sichtbar.
- [x] RDAP49 live bestaetigt: Gruppen/Sessions read-only sichtbar.
- [x] RDAP49 live bestaetigt: Button Admin-Notizen oeffnen sichtbar.
- [x] RDAP49B Live-Bestaetigung dokumentiert.

## Offen / Naechstes

- [ ] RDAP50 planen: Bruecke User-Detail -> Admin-Notizen pruefen/polieren.
- [ ] Optional live pruefen: Button Admin-Notizen oeffnen setzt Zieluser korrekt.
- [ ] Optional Ruecksprung/Statushinweis zwischen User-Detail und Admin-Notizen planen.
- [ ] Admin-Note Update/Deactivate nur als separater geplanter Step mit Audit/Lock/Backup/Confirm.
- [ ] Permission-Verwaltung in der UI separat planen, nicht mit Admin-Notizen vermischen.
- [ ] Community-Seiten duerfen Admin-Notizen weiterhin nicht lesen.
- [ ] Rollen-/Gruppen-Schreibverwaltung bleibt gesperrt bis eigener Write-Scope geplant ist.
