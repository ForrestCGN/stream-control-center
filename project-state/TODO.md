# TODO

Stand: RDAP59_ADMIN_NOTES_COMMUNITY_READ_SCOPE_PLAN  
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

## Offen / Naechstes

- [ ] RDAP60 planen: Admin-Note Update/Deactivate-Scope klaeren oder bewusst weiter read-only bleiben.
- [ ] Klaeren, ob zuerst Update oder Deactivate geplant wird.
- [ ] Admin-Note Update/Deactivate nur als separater geplanter Step mit Audit/Lock/Backup/Confirm/Readback.
- [ ] Community-Seiten duerfen Admin-Notizen weiterhin nicht lesen, bis ein separater Scope umgesetzt und bestaetigt ist.
- [ ] Permission-Verwaltung in der UI separat planen, nicht mit Admin-Notizen vermischen.

## Weiterhin verboten / nicht versehentlich bauen

- [ ] Keine Community-Read-Freigabe fuer Admin-Notizen ohne separaten Scope.
- [ ] Keine bestehende Admin-Readroute fuer Public-/Community-/Profil-UI verwenden.
- [ ] Kein physisches Delete.
- [ ] Keine Rollen-/Gruppen-/Permission-Writes.
- [ ] Keine Session-Revocation in der UI.
- [ ] Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Control.
