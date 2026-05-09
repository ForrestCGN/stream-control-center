# Changelog

## 2026-05-09

### STEP203.3.3 - Loyalty Presence Runner Function Fix

- Presence Runner korrigiert:
  - vorher: `processWatchHeartbeat(...)`
  - jetzt: `recordWatchHeartbeat(...)`
- Behebt Fehler:
  - `processWatchHeartbeat is not defined`
- Keine DB-/Schema-/Settings-Änderung.
- Keine Funktionalität entfernt.
