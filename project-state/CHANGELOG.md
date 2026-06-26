# CHANGELOG

## RDAP53_PERMISSION_READ_DETAIL_POLISH_PREPARED - 2026-06-26

- Permission-/Rollen-/Module-Read-Detail-Polish vorbereitet.
- `remote-modboard/backend/src/app.js` erweitert:
  - bestehende RDAP28/RDAP51 UI-Injektion bleibt erhalten.
  - `rdap53-permission-read-detail.js` wird zusaetzlich einmalig eingebunden.
  - Rueckwaertskompatibler Export `injectRdap28AdminNotesUi` bleibt erhalten.
- Neues Frontend-Asset `remote-modboard/backend/public/assets/rdap53-permission-read-detail.js` erstellt:
  - liest nur `/api/remote/auth/model`.
  - zeigt fuer den ausgewaehlten Admin-User read-only Rollen-Permissions.
  - zeigt relevante Module-/Target-Permissions fuer Rollen/Gruppen/User.
  - zeigt Diagnosehinweis, dass Frontend keine Sicherheitsentscheidung trifft.
- Keine neue Backend-Route.
- Keine DB-Migration.
- Keine Permission-Writes.
- Keine Rollen-/Gruppen-/Session-Schreibverwaltung.

## RDAP52_PERMISSION_READ_DETAIL_POLISH_PLAN - 2026-06-26

- Permission-/Rollen-Read-Detail-Polish geplant.
- Ziel: bessere read-only Sicht auf User-Rollen, Gruppen, Permissions und Module/Targets.
- Bestehende Datenquelle `/api/remote/auth/model` reicht fuer den vorbereiteten UI-Step.
- Keine Code-Aenderung.
- Kein Webserver-Deploy noetig.
