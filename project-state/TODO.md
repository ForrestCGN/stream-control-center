# TODO

Stand: RDAP60_ADMIN_NOTES_UPDATE_DEACTIVATE_SCOPE_PLAN  
Datum: 2026-06-26

## Erledigt

- [x] RDAP47 Zieluser-Suche/Filter fuer Admin-Notizen live bestaetigt.
- [x] RDAP48 Admin-User-Detail read-only geplant.
- [x] RDAP49 Admin-User-Detail read-only umgesetzt und live bestaetigt.
- [x] RDAP49B Live-Bestaetigung Admin-User-Detail dokumentiert.
- [x] RDAP50 Bruecke User-Detail zu Admin-Notizen geplant.
- [x] RDAP51 Bruecke User-Detail zu Admin-Notizen Frontend-only umgesetzt.
- [x] RDAP51 live bestaetigt: Kontext-Hinweis, Zieluser-Uebernahme, Ruecksprung und Hinweis ausblenden sichtbar.
- [x] RDAP51B Live-Bestaetigung dokumentiert.
- [x] RDAP52 Permission-/Rollen-Read-Details geplant.
- [x] RDAP53 Permission-Read-Detail-Polish umgesetzt und live sichtbar.
- [x] RDAP53B Live-Bestaetigung dokumentiert.
- [x] RDAP54 Empty-Targets-Polish geplant.
- [x] RDAP55 Empty-Targets-Polish umgesetzt und live sichtbar.
- [x] RDAP55B Live-Bestaetigung dokumentiert.
- [x] RDAP56 Permission-Detail naechster Scope geplant.
- [x] RDAP57 Permission-Read-Detail Categories-Polish umgesetzt und live sichtbar.
- [x] RDAP57B Live-Bestaetigung dokumentiert.
- [x] RDAP58 Permission-Read-Detail-Strang bewertet / Wrapup geplant.
- [x] RDAP59 Admin-Notizen Community-Read-Scope geplant.
- [x] RDAP60 Admin-Note Update/Deactivate-Scope geplant.

## Offen / Naechstes

- [ ] RDAP61 planen/umsetzen: kleinsten Admin-Note Update-Backend-Scope.
- [ ] Vor RDAP61 echte Dateien aus GitHub/dev lesen.
- [ ] Pruefen, ob bestehender disabled Service sinnvoll erweitert/umgebaut wird oder ob sauberer eigener Update-Service besser passt.
- [ ] Update nur fuer aktive Notizen erlauben.
- [ ] Update mit Session, DashboardAccess, remote.view, admin.users.note.write, Body-confirmWrite, Lock, Audit ohne raw note_text und Readback absichern.
- [ ] Deactivate weiterhin separat planen.

## Weiterhin verboten / nicht versehentlich bauen

- [ ] Kein Admin-Note Deactivate im Update-Step.
- [ ] Kein physisches Delete.
- [ ] Keine Community-Read-Freigabe fuer Admin-Notizen ohne separaten Scope.
- [ ] Keine bestehende Admin-Readroute fuer Public-/Community-/Profil-UI verwenden.
- [ ] Keine Rollen-/Gruppen-/Permission-Writes.
- [ ] Keine Session-Revocation in der UI.
- [ ] Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Control.
