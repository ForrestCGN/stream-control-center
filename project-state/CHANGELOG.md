# CHANGELOG

## RDAP54_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PLAN - 2026-06-26

- RDAP54 als Plan-only dokumentiert.
- Ausgangslage aus RDAP53B uebernommen:
  - RDAP53-Karten sind live sichtbar.
  - Effektive Rollen-Rechte sind sichtbar.
  - ForrestCGN / owner zeigt 8 Rechte.
  - Modulbezogene Rechte zeigen 0 Targets.
  - `model.modulePermissions` liefert aktuell 0 Eintraege.
- Bewertung dokumentiert:
  - `0 Targets` ist technisch korrekt.
  - Anzeige kann aber wie ein Fehler wirken.
- Naechster empfohlener Step:
  - RDAP55 als kleiner Frontend-only Text-/Diagnose-Polish in bestehender RDAP53-Datei.
- Doku-only.
- Kein Webserver-Deploy noetig.

## RDAP53B_PERMISSION_READ_DETAIL_POLISH_LIVE_CONFIRMED_DOCS - 2026-06-26

- RDAP53 Live-Bestaetigung dokumentiert.
- Bestaetigt:
  - Admin -> User-Detail zeigt RDAP53-Karten.
  - Effektive Rollen-Rechte sichtbar.
  - ForrestCGN / owner zeigt 8 Rechte.
  - Modulbezogene Rechte sichtbar.
  - 0 Targets plausibel, weil `model.modulePermissions` leer ist.
- Doku-only.
- Kein Webserver-Deploy noetig.

## RDAP53_PERMISSION_READ_DETAIL_POLISH_PREPARED - 2026-06-26

- Read-only Permission-Detail-Polish vorbereitet.
- `app.js` erweitert bestehende Script-Injection.
- `rdap53-permission-read-detail.js` hinzugefuegt.
- Keine neue Backend-Route.
- Keine DB-Migration.
- Keine Writes.
