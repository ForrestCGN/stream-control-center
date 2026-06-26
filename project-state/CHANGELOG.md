# CHANGELOG

## RDAP48_ADMIN_USER_DETAIL_READONLY_PLAN - 2026-06-26

- Naechsten sichtbaren Admin-User-Schritt geplant:
  - `RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED`
- Ziel:
  - Admin-User-Detailseite/read-only Detailbereich.
  - Daten aus vorhandenem `/api/remote/auth/model` nutzen.
  - User-Kopf, Rollen, Gruppen und Sessions read-only anzeigen.
  - Vorhandene RDAP44/RDAP47 Admin-Notizen-Zieluser-Auswahl wiederverwenden.
- Gepruefte echte Strukturen:
  - `remote-modboard/backend/src/routes/auth-model.routes.js`
  - `remote-modboard/backend/src/services/auth-db-read.service.js`
  - `remote-modboard/backend/public/assets/remote-modboard.js`
  - `remote-modboard/backend/public/assets/rdap28-admin-notes.js`
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

## RDAP45C_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_LIVE_CONFIRMED_DOCS - 2026-06-26

- RDAP45B Live-Bestaetigung dokumentiert.
- `twitch/start HTTP 302` ist bei aktivem Login korrekt.
- `twitch/callback HTTP 403` ohne gueltigen OAuth-State bleibt Pflicht.
- Login funktioniert wieder.
- RDAP44 Admin-Notizen-Zieluser-Auswahl bleibt intakt.

## RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN - 2026-06-26

- Naechsten kleinen Admin-Notizen-Step geplant.
- Empfehlung: Zieluser-Suche/Filter als Frontend-only Komfort-Step.
- Keine Code-Aenderung.
- Kein Webserver-Deploy noetig.
