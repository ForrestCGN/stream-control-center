# CHANGELOG

## STEP278V2

- Real Alert Bus Mirror direkt in `alert_system.js` integriert.
- Runtime-only API für Status/Aktivieren/Deaktivieren ergänzt.
- `communication_bus.js` exportiert `getBus`, damit bestehende Module denselben Bus nutzen können.
- Kein neues Modul und keine Parallelzuständigkeit.
- Keine Alert-DB-Migration und kein Ersatz von `broadcastWS`.
