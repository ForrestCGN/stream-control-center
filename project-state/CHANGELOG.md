# CHANGELOG

## RDAP50_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PLAN - 2026-06-26

- Naechsten kleinen sichtbaren UI-Polish geplant:
  - `RDAP51_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PREPARED`
- Ziel:
  - Bruecke `Admin -> User-Detail` zu `Admin -> Admin-Notizen` eindeutiger machen.
  - Button `Admin-Notizen oeffnen` soll Zieluser sichtbar und nachvollziehbar uebernehmen.
  - Kontext-Hinweis in Admin-Notizen planen.
  - Optional Ruecksprung zu User-Detail planen.
- Keine Code-Aenderung.
- Keine Backend-Aenderung.
- Keine DB-Migration.
- Keine Permission-Verwaltung.
- Kein Admin-Note Update/Deactivate/Delete.
- Kein Webserver-Deploy noetig.

## RDAP49B_ADMIN_USER_DETAIL_READONLY_LIVE_CONFIRMED_DOCS - 2026-06-26

- RDAP49 Live-Bestaetigung dokumentiert.
- Bestaetigt:
  - `Admin -> User-Detail` sichtbar.
  - ForrestCGN / `tw:127709954` sichtbar.
  - Rolle `owner` sichtbar.
  - Gruppen/Sessions read-only sichtbar.
  - Button `Admin-Notizen oeffnen` sichtbar.
- Doku-only.

## RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED - 2026-06-26

- Admin-User-Detail read-only vorbereitet.
- `rdap28-admin-notes.js` erweitert:
  - neue Ansicht `Admin -> User-Detail`.
  - User-Auswahl/Suche aus vorhandenem Auth-Modell.
  - User-Kopf mit Name/Login/UID/Status/letztem Login.
  - Rollen/Gruppen/Sessions read-only.
  - Button `Admin-Notizen öffnen` nutzt vorhandene RDAP44/RDAP47 Zieluser-Auswahl.
  - Diagnose-/Komfort-API `window.RdapAdminNotes.openUserDetail(user)`.
- Keine Backend-Aenderung.
- Keine DB-Migration.
- Keine Permission-Verwaltung.
- Kein Admin-Note Update/Deactivate/Delete.

## RDAP48_ADMIN_USER_DETAIL_READONLY_PLAN - 2026-06-26

- Naechsten sichtbaren Admin-User-Schritt geplant:
  - `RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED`
- Ziel:
  - Admin-User-Detailseite/read-only Detailbereich.
  - Daten aus vorhandenem `/api/remote/auth/model` nutzen.
  - User-Kopf, Rollen, Gruppen und Sessions read-only anzeigen.
  - Vorhandene RDAP44/RDAP47 Admin-Notizen-Zieluser-Auswahl wiederverwenden.
- Keine Code-Aenderung.
- Keine Backend-Aenderung.
- Keine DB-Migration.
- Keine Permission-Verwaltung.
- Kein Webserver-Deploy noetig.

## RDAP47B_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_LIVE_CONFIRMED_DOCS - 2026-06-26

- RDAP47 Live-Bestaetigung dokumentiert.
- Bestaetigt:
  - Suchfeld sichtbar.
  - Suche nach `Forrest` funktioniert.
  - Trefferanzeige `1 / 2`.
  - Read true.
  - Write true.
  - 3 Admin-Notizen geladen.
  - Create nutzt Zieluser `tw:127709954`.
- Doku-only.
