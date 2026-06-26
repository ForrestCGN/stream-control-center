# TODO

Stand: RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_PREPARED  
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
- [x] RDAP45 OAuth-Safety-Fix vorbereitet: Twitch-Start braucht jetzt explizites RDAP_TWITCH_OAUTH_START_RELEASED=true.

## Offen / Naechstes

- [ ] RDAP45 lokal per `installstep.cmd` einspielen.
- [ ] RDAP45 `node --check` fuer `auth-twitch-oauth.service.js` ausfuehren.
- [ ] RDAP45 per `stepdone.cmd` nach GitHub/dev bringen.
- [ ] RDAP45 Webserver-Deploy aus frischem GitHub/dev-Clone ausfuehren.
- [ ] Nach Deploy bestaetigen: `/api/remote/auth/twitch/start` liefert HTTP 403.
- [ ] Nach Deploy bestaetigen: `/api/remote/auth/twitch/callback` liefert HTTP 403.
- [ ] Nach Deploy bestaetigen: Deploy-Script laeuft ohne OAuth-Safety-Fehler durch.
- [ ] Danach RDAP45B Live-Bestaetigung dokumentieren.
- [ ] Admin-Note Update/Deactivate nur als separater geplanter Step mit Audit/Lock/Backup/Confirm.
- [ ] Permission-Verwaltung in der UI separat planen, nicht mit Admin-Notizen-UI vermischen.
- [ ] Community-Seiten duerfen Admin-Notizen weiterhin nicht lesen.
- [ ] Spaeter echte Admin-User-Detailseite planen, falls mehr als die aktuelle Zieluser-Auswahl gebraucht wird.
