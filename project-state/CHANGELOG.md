# CHANGELOG

## STEP279

- Kommunikations-Audit für Alert-/Overlay-/Sound-Pfad dokumentiert.
- Testergebnisse aus Real Alert Mirror, Timing Diagnostics, Overlay Watchdog und Recovery zusammengeführt.
- Neue Ergebnisdoku: `docs/backend/COMMUNICATION_AUDIT_STEP279_RESULT.md`.
- Aktuelle Routen und Debug-View als Referenz festgehalten.
- Keine Code-Logik geändert.

## STEP278Z

- Alert Overlay Watchdog um sichere manuelle Recovery erweitert.
- Neue Route: `/api/alerts/overlay-watchdog/recover?confirm=1`.
- Communication Debug View um Recovery-Button und Recovery-Status erweitert.
