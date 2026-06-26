# TODO

Stand: RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED  
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
- [x] RDAP45 OAuth-Safety-Fix vorbereitet: Twitch-Start braucht explizites RDAP_TWITCH_OAUTH_START_RELEASED=true.
- [x] RDAP45 Live-Befund korrigiert: Login wird genutzt; mit RDAP_TWITCH_OAUTH_START_RELEASED=true liefert twitch/start korrekt 302.
- [x] RDAP45B Deploy-Safety-Fix vorbereitet: twitch/start darf 302 oder 403 sein, callback ohne State bleibt 403.

## Offen / Naechstes

- [ ] RDAP45B lokal per `installstep.cmd` einspielen.
- [ ] RDAP45B `bash -n tools/remote-modboard-deploy.sh` ausfuehren, falls lokal Bash verfuegbar; sonst Webserver-Deploy-Scriptlauf als Shell-Check verwenden.
- [ ] RDAP45B per `stepdone.cmd` nach GitHub/dev bringen.
- [ ] RDAP45B Webserver-Deploy aus frischem GitHub/dev-Clone ausfuehren.
- [ ] Nach Deploy bestaetigen: `/api/remote/auth/twitch/start` liefert HTTP 302 bei aktivem Login oder 403 bei gesperrtem Login.
- [ ] Nach Deploy bestaetigen: `/api/remote/auth/twitch/callback` liefert HTTP 403 ohne gueltigen OAuth-State.
- [ ] Nach Deploy bestaetigen: Deploy-Script laeuft ohne OAuth-Safety-Fehler durch.
- [ ] Nach Deploy bestaetigen: Login-Button funktioniert weiter.
- [ ] Danach RDAP45C Live-Bestaetigung dokumentieren.
- [ ] Admin-Note Update/Deactivate nur als separater geplanter Step mit Audit/Lock/Backup/Confirm.
- [ ] Permission-Verwaltung in der UI separat planen, nicht mit Admin-Notizen-UI vermischen.
- [ ] Community-Seiten duerfen Admin-Notizen weiterhin nicht lesen.
- [ ] Spaeter echte Admin-User-Detailseite planen, falls mehr als die aktuelle Zieluser-Auswahl gebraucht wird.
