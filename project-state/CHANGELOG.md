# CHANGELOG

## RDAP49B_ADMIN_USER_DETAIL_READONLY_LIVE_CONFIRMED_DOCS - 2026-06-26

- RDAP49 Live-Bestaetigung dokumentiert.
- Bestaetigt:
  - `Admin -> User-Detail` ist sichtbar.
  - User-Auswahl ist sichtbar.
  - ForrestCGN / `tw:127709954` ist ausgewaehlt.
  - Name/Login/UID/Status sind sichtbar.
  - Rollen: 1.
  - Gruppen: 0.
  - Sessions: 4.
  - Aktive Rolle `owner` ist sichtbar.
  - Gruppen und Sessions werden read-only angezeigt.
  - Sicherheitskarte `Keine Schreibverwaltung` ist sichtbar.
  - Button `Admin-Notizen oeffnen` ist sichtbar.
- Doku-only.
- Kein Webserver-Deploy noetig.

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

## RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED - 2026-06-26

- Admin-Notizen-Zieluser-Auswahl komfortabler gemacht.
- `rdap28-admin-notes.js` erweitert:
  - Suchfeld nach Name/Login/UID/Status/Rollen.
  - Button `Suche leeren`.
  - Trefferanzeige gefiltert/gesamt.
  - Ausgewaehlter Zieluser bleibt sichtbar, auch wenn der Filter ihn nicht trifft.
  - `window.RdapAdminNotes.setTargetSearch(term)` fuer Diagnose/Komfort ergaenzt.
- Default ForrestCGN / `tw:127709954` bleibt erhalten.
- Read/Create nutzen weiterhin den ausgewaehlten Zieluser.
- Keine Backend-Aenderung.
- Keine DB-Migration.
- Keine Permission-Verwaltung.
- Kein Admin-Note Update/Deactivate/Delete.
