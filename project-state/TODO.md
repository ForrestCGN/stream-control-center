# TODO

Stand: RDAP52_PERMISSION_READ_DETAIL_POLISH_PLAN  
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

## Offen / Naechstes

- [ ] RDAP53 Permission-/Rollen-Read-Details frontend-only vorbereiten.
- [ ] Pruefen, welche Detaildaten aus `/api/remote/auth/model` fuer die Umsetzung eindeutig reichen.
- [ ] Effektive Rechte read-only darstellen, bevor irgendeine Permission-Schreibverwaltung geplant wird.
- [ ] Bei fehlender Gruppierung/Quelle nicht raten, sondern Datenluecke dokumentieren.
- [ ] Admin-Note Update/Deactivate nur als separater geplanter Step mit Audit/Lock/Backup/Confirm.
- [ ] Permission-Verwaltung in der UI separat planen, nicht mit Admin-Notizen vermischen.
- [ ] Community-Seiten duerfen Admin-Notizen weiterhin nicht lesen.
