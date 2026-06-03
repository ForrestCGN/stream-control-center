# CHANGELOG

## CAN-42.14b - Dashboard Diagnostics Label-/Zeit-Anzeige-Cleanup

Geändert:

- `htdocs/dashboard/modules/diagnostics_generic_details.js`
  - `MODULE_VERSION` auf `0.1.2-can42-14b` erhöht.
  - Technische Keys im generischen Diagnostics-Block werden lesbarer beschriftet.
  - Millisekundenwerte werden mit Einheit dargestellt.
  - Timestamp-Millisekunden wie `clientLastSeenAt` werden als Datum/Uhrzeit dargestellt.
  - Überschriften auf `Standard-Diagnose` und `Zähler` geglättet.

Nicht geändert:

- kein Backend
- keine Statusrouten
- keine DB
- keine produktiven Aktionen
- keine Funktionalität entfernt
