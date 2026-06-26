# TODO

Stand: RDAP45C_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_LIVE_CONFIRMED_DOCS  
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
- [x] RDAP45 OAuth-Start-Gate vorbereitet: Twitch-Start braucht explizites RDAP_TWITCH_OAUTH_START_RELEASED=true.
- [x] RDAP45B Deploy-Safety korrigiert: twitch/start darf 302 bei bewusst aktivem Login oder 403 bei gesperrtem Login liefern; callback ohne State bleibt 403.
- [x] RDAP45B live bestaetigt: twitch/start 302, twitch/callback 403, Login ok.
- [x] RDAP45C Live-Bestaetigung dokumentiert.

## Offen / Naechstes

- [ ] RDAP46 Admin-Notizen-/Admin-User-Next-Step planen.
- [ ] Entscheiden, ob zuerst Komfort fuer Zieluser-Auswahl oder echte Admin-User-Detailseite kommt.
- [ ] Admin-Note Update nur als separater geplanter Step mit Audit/Lock/Backup/Confirm.
- [ ] Admin-Note Deactivate nur als separater geplanter Step mit Audit/Lock/Backup/Confirm.
- [ ] Permission-Verwaltung in der UI separat planen, nicht mit Admin-Notizen-UI vermischen.
- [ ] Community-Seiten duerfen Admin-Notizen weiterhin nicht lesen.
- [ ] Spaeter echte Admin-User-Detailseite planen, falls mehr als die aktuelle Zieluser-Auswahl gebraucht wird.
