# TODO

Stand: RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION  
Datum: 2026-06-26

## Erledigt

- [x] RDAP59 Admin-Notizen Community-Read-Scope geplant: Admin-only bleibt Grenze.
- [x] RDAP60 Admin-Note Update/Deactivate-Scope geplant: Update zuerst, Deactivate separat.
- [x] RDAP61 Admin-Note Update Backend aktiviert.

## Offen / Naechstes

- [ ] RDAP61 lokal einspielen, Node-Checks ausfuehren, git status pruefen.
- [ ] Bei Erfolg `stepdone.cmd` ausfuehren.
- [ ] Danach Webserver-Deploy aus frischem GitHub/dev-Clone.
- [ ] RDAP61B Live-Bestaetigung dokumentieren.
- [ ] Optional sicheren Update-Test nur mit gueltiger Admin-Session und confirmWrite:true dokumentieren.

## Weiterhin verboten / nicht versehentlich bauen

- [ ] Keine Update-UI ohne separaten Plan.
- [ ] Kein Admin-Note Deactivate in RDAP61.
- [ ] Kein physisches Delete.
- [ ] Keine Community-Read-Freigabe fuer Admin-Notizen ohne separaten Scope.
- [ ] Keine bestehende Admin-Readroute fuer Public-/Community-/Profil-UI verwenden.
- [ ] Keine Rollen-/Gruppen-/Permission-Writes.
- [ ] Keine Session-Revocation in der UI.
- [ ] Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Control.
