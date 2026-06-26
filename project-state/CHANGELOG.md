# CHANGELOG

## RDAP53B_PERMISSION_READ_DETAIL_POLISH_LIVE_CONFIRMED_DOCS - 2026-06-26

- RDAP53 Live-Bestaetigung dokumentiert.
- Bestaetigt:
  - Admin -> User-Detail zeigt neue RDAP53-read-only Karten.
  - Effektive Rollen-Rechte werden angezeigt.
  - ForrestCGN / owner zeigt 8 Rollenrechte.
  - Modulbezogene Rechte zeigen 0 Targets.
  - 0 Targets ist plausibel, weil `/api/remote/auth/model` aktuell 0 `modulePermissions` liefert.
  - Keine Rollen-/Gruppen-/Permission-/Session-Schreibbuttons sichtbar.
- Live-API-Befund dokumentiert:
  - `/api/remote/status` ok.
  - `/api/remote/auth/model` ok/readOnly/writeEnabled=false.
  - `rolePermissions=21`.
  - `modulePermissions=0`.
- Doku-only.
- Kein Webserver-Deploy noetig.

## RDAP53_PERMISSION_READ_DETAIL_POLISH_PREPARED - 2026-06-26

- Frontend-only Permission-Read-Detail-Polish vorbereitet.
- `remote-modboard/backend/src/app.js` erweitert:
  - bestehendes `rdap28-admin-notes.js` bleibt erhalten.
  - neues read-only Asset `rdap53-permission-read-detail.js` wird injiziert.
- Neues Asset:
  - `remote-modboard/backend/public/assets/rdap53-permission-read-detail.js`
- Keine neue Backend-Route.
- Keine DB-Migration.
- Keine Writes.
