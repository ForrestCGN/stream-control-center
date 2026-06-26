# CHANGELOG

## RDAP51B_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_LIVE_CONFIRMED_DOCS - 2026-06-26

- RDAP51 Live-Bestaetigung dokumentiert.
- Bestaetigt:
  - Admin-Notizen werden aus User-Detail heraus geoeffnet.
  - Kontext-Hinweis `Aus User-Detail geoeffnet` ist sichtbar.
  - ForrestCGN @forrestcgn / `tw:127709954` wird korrekt uebernommen.
  - Hinweis bestaetigt, dass Read/Create weiterhin exakt diesen Zieluser verwenden.
  - Button `Zurueck zum User-Detail` ist sichtbar.
  - Button `Hinweis ausblenden` ist sichtbar.
- Doku-only.
- Kein Webserver-Deploy noetig.

## RDAP51_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PREPARED - 2026-06-26

- Bruecke User-Detail -> Admin-Notizen Frontend-only vorbereitet.
- `rdap28-admin-notes.js` erweitert:
  - Kontext-Hinweis in Admin-Notizen bei Oeffnung aus User-Detail.
  - Sichtbare Uebernahme des Zielusers.
  - Ruecksprung zum User-Detail.
  - Hinweis ausblenden.
  - Komfort-/Diagnose-API `window.RdapAdminNotes.openNotesForUser(user)`.
- Keine Backend-Aenderung.
- Keine DB-Migration.
- Keine Permission-Verwaltung.
- Kein Admin-Note Update/Deactivate/Delete.

## RDAP50_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PLAN - 2026-06-26

- Bruecke User-Detail -> Admin-Notizen geplant.
- Ziel:
  - Button Admin-Notizen oeffnen uebernimmt denselben Zieluser.
  - Admin-Notizen zeigt Kontext-Hinweis.
  - Optional Ruecksprung zum User-Detail.
- Keine Code-Aenderung.
- Kein Webserver-Deploy noetig.
