# TODO

Stand: RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN  
Datum: 2026-06-26

## Erledigt

- [x] RDAP36 Audit-Testinsert live bestaetigt.
- [x] RDAP37 Lock Acquire/Heartbeat/Release live bestaetigt.
- [x] RDAP38 Admin-Note-Write-Planroute live bestaetigt.
- [x] RDAP39 Backend-Create-Write fuer Admin-Notizen gebaut und live bestaetigt.
- [x] RDAP39C Admin-Note Read-Route wiederhergestellt/synchronisiert und live bestaetigt.
- [x] RDAP40 Admin-Note Create-UI gebaut und live bestaetigt.
- [x] RDAP40B Doku-only erstellt und nach GitHub/dev gebracht.
- [x] RDAP41 Status-Cleanup geplant/dokumentiert.
- [x] RDAP42 Status-/Routes-Semantik bereinigt und live bestaetigt.
- [x] RDAP42B Doku-only erstellt und nach GitHub/dev gebracht.
- [x] RDAP43 Zieluser-Auswahl/Admin-User-Detail fuer Admin-Notizen geplant.
- [x] RDAP44 Admin-Notizen-UI mit Zieluser-Auswahl umgesetzt.
- [x] RDAP44 live funktional bestaetigt: Dropdown sichtbar, Default ForrestCGN / tw:127709954, Read/Create nutzen Zieluser.
- [x] RDAP44B Live-Bestaetigung dokumentiert.
- [x] RDAP45 OAuth-Start-Gate vorbereitet.
- [x] RDAP45B Deploy-Safety fuer aktiv genutzten Login korrigiert.
- [x] RDAP45B live bestaetigt: twitch/start 302, twitch/callback 403, Login ok.
- [x] RDAP45C Live-Bestaetigung dokumentiert.
- [x] RDAP46 naechsten kleinen Admin-Notizen-Schritt geplant.

## Offen / Naechstes

- [ ] RDAP46 lokal per `installstep.cmd` einspielen.
- [ ] RDAP46 `git status` pruefen.
- [ ] RDAP46 per `stepdone.cmd` nach GitHub/dev bringen.
- [ ] Kein Webserver-Deploy fuer RDAP46 noetig, da Doku-only.
- [ ] RDAP47 vorbereiten: Zieluser-Auswahl in Admin-Notizen komfortabler machen.
- [ ] Vor RDAP47 echte Frontend-Dateien erneut pruefen.
- [ ] Admin-Note Update/Deactivate nur als separater geplanter Step mit Audit/Lock/Backup/Confirm.
- [ ] Permission-Verwaltung in der UI separat planen, nicht mit Admin-Notizen-UI vermischen.
- [ ] Community-Seiten duerfen Admin-Notizen weiterhin nicht lesen.
- [ ] Spaeter echte Admin-User-Detailseite planen, falls mehr als die aktuelle Zieluser-Auswahl gebraucht wird.
