# TODO

Stand: RDAP42B_ADMIN_NOTE_STATUS_SEMANTICS_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Erledigt

- [x] RDAP36 Audit-Testinsert live bestaetigt.
- [x] RDAP37 Lock Acquire/Heartbeat/Release live bestaetigt.
- [x] RDAP38 Admin-Note-Write-Planroute live bestaetigt.
- [x] RDAP39 Backend-Create-Write fuer Admin-Notizen gebaut.
- [x] RDAP39 Webserver-Deploy aus frischem GitHub/dev-Clone ausgefuehrt.
- [x] RDAP39 echter Admin-Note-Create-Write fuer ForrestCGN erfolgreich.
- [x] RDAP39 Audit Attempt + Success erfolgreich.
- [x] RDAP39 Lock Acquire + Release erfolgreich.
- [x] RDAP39B Doku-only erstellt.
- [x] RDAP39C Admin-Note Read-Route wiederhergestellt/synchronisiert.
- [x] RDAP39C Webserver-Deploy ausgefuehrt.
- [x] RDAP39C Read-Route mit gueltiger Session erfolgreich getestet.
- [x] RDAP40 Admin-Note Create-UI gebaut.
- [x] RDAP40 Webserver-Deploy ausgefuehrt.
- [x] RDAP40 Browser-UI zeigt 3 Admin-Notizen.
- [x] RDAP40 Button "Neue Notiz" sichtbar bei write-berechtigtem Admin.
- [x] RDAP40 Create ueber UI erfolgreich getestet.
- [x] RDAP40 neue Testnotiz erstellt: `admin_note_20260625171342_d1f871dd6370`.
- [x] RDAP40 Readback/Refresh nach Create erfolgreich.
- [x] Bestaetigt: Keine Update-/Deactivate-/Delete-Buttons sichtbar.
- [x] RDAP40B Doku-only erstellt und nach GitHub/dev gebracht.
- [x] RDAP41 Status-Semantik-Cleanup geplant/dokumentiert und nach GitHub/dev gebracht.
- [x] RDAP42 Status-/Routes-Semantik-Cleanup gebaut.
- [x] RDAP42 Webserver-Deploy ausgefuehrt.
- [x] RDAP42 `/api/remote/routes` live getestet.
- [x] RDAP42 `/api/remote/status` live getestet.
- [x] RDAP42 bestaetigt: keine neue Schreibfunktion.
- [x] RDAP42B Doku-only erstellt.

## Offen / Naechstes

- [ ] RDAP42B lokal per `installstep.cmd` einspielen.
- [ ] RDAP42B `git status` pruefen.
- [ ] RDAP42B per `stepdone.cmd` nach GitHub/dev bringen.
- [ ] Kein Webserver-Deploy fuer RDAP42B noetig, da Doku-only.
- [ ] RDAP43 planen: Admin-User-Detailseite / Zieluser-Auswahl fuer Admin-Notizen statt fixem `tw:127709954`.
- [ ] Spaeter: Admin-Note Update/Deactivate nur als separater geplanter Step mit Audit/Lock/Backup/Confirm.
