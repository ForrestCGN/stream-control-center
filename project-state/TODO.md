# TODO

Stand: RDAP44B_ADMIN_NOTE_TARGET_USER_SELECTION_LIVE_CONFIRMED_DOCS  
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

## Offen / Naechstes

- [ ] RDAP45 OAuth-Safety-Befund pruefen: `/api/remote/auth/twitch/start` liefert HTTP 302 statt erwartetem HTTP 403.
- [ ] Entscheiden, ob der OAuth-Safety-Check angepasst werden muss oder die Twitch-Start-Route haerter blockiert werden soll.
- [ ] Admin-Note Update/Deactivate nur als separater geplanter Step mit Audit/Lock/Backup/Confirm.
- [ ] Permission-Verwaltung in der UI separat planen, nicht mit Admin-Notizen-UI vermischen.
- [ ] Community-Seiten duerfen Admin-Notizen weiterhin nicht lesen.
- [ ] Spaeter echte Admin-User-Detailseite planen, falls mehr als die aktuelle Zieluser-Auswahl gebraucht wird.
