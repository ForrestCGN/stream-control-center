# CHANGELOG

## RDAP55_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PREPARED - 2026-06-26

- Frontend-only Polish fuer RDAP53 Permission-Read-Detail vorbereitet.
- `remote-modboard/backend/public/assets/rdap53-permission-read-detail.js` erweitert:
  - Leere Module-/Targetrechte werden verstaendlicher erklaert.
  - `0 Targets` wird nicht mehr nur generisch als leerer Eintrag angezeigt.
  - Hinweis: Auth-Modell liefert aktuell 0 `modulePermissions`.
  - Hinweis: Rollenrechte werden separat unter `Effektive Rollen-Rechte` angezeigt.
  - Diagnose-Zeilen fuer `rolePermissions` und `modulePermissions` ergaenzt.
- Keine neue Datei fuer die UI erstellt.
- Keine Aenderung an `app.js`.
- Keine Aenderung an `index.html`.
- Keine Backend-Route.
- Keine DB-Migration.
- Keine Writes.

## RDAP54_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PLAN - 2026-06-26

- RDAP55 geplant.
- Ziel: 0-Targets-Anzeige bei modulbezogenen Rechten besser erklaeren.
- Doku-only.
- Kein Webserver-Deploy noetig.

## RDAP53B_PERMISSION_READ_DETAIL_POLISH_LIVE_CONFIRMED_DOCS - 2026-06-26

- RDAP53 Live-Bestaetigung dokumentiert.
- Bestaetigt:
  - Admin -> User-Detail zeigt RDAP53-Karten.
  - Effektive Rollen-Rechte sichtbar.
  - ForrestCGN / owner zeigt 8 Rechte.
  - Modulbezogene Rechte zeigen 0 Targets.
  - 0 Targets ist plausibel, weil `model.modulePermissions` leer ist.
- Doku-only.
- Kein Webserver-Deploy noetig.
