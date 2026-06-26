# TODO

Stand: RDAP61B_ADMIN_NOTE_UPDATE_BACKEND_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26

## Erledigt

- [x] RDAP59 Admin-Notizen Community-Read-Scope geplant: Admin-only bleibt gesetzt.
- [x] RDAP60 Admin-Note Update/Deactivate-Scope geplant: Update zuerst, Deactivate separat.
- [x] RDAP61 Admin-Note Update Backend umgesetzt.
- [x] RDAP61 live deployed und bestaetigt.
- [x] RDAP61B Live-Bestaetigung dokumentiert.

## Offen / Naechstes

- [ ] RDAP62 Status-Semantik nach RDAP61 bereinigen.
- [ ] `/api/remote/status` darf nicht mehr pauschal sagen, Admin-Note Update sei deaktiviert.
- [ ] Create-UI und Update-Backend in Status/Routes klar trennen.
- [ ] Danach erst Update-UI planen.

## Weiterhin verboten / nicht versehentlich bauen

- [ ] Keine Update-UI ohne separaten Plan.
- [ ] Kein Admin-Note Deactivate im Status-Cleanup.
- [ ] Kein physisches Delete.
- [ ] Keine Community-Read-Freigabe fuer Admin-Notizen.
- [ ] Keine bestehende Admin-Readroute fuer Public-/Community-/Profil-UI verwenden.
- [ ] Keine Rollen-/Gruppen-/Permission-Writes.
- [ ] Keine Session-Revocation in der UI.
- [ ] Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Control.
