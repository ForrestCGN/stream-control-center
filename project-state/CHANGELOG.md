
## STEP278W - Alert Timing Diagnostics

- Timing-Diagnose für echte Alert-Bus-Mirror-Events ergänzt.
- `alert_system.js` misst queued, waitingForSound, soundBundleReady, soundWaitDone, playing, overlaySent und busMirrorSent.
- `/api/alerts/bus-mirror/status` gibt `timing` zum letzten gespiegelten Alert aus.
- Keine neue Alert-Logik, kein neues Modul, keine DB-Migration.

# CHANGELOG

## STEP278V2

- Real Alert Bus Mirror direkt in `alert_system.js` integriert.
- Runtime-only API für Status/Aktivieren/Deaktivieren ergänzt.
- `communication_bus.js` exportiert `getBus`, damit bestehende Module denselben Bus nutzen können.
- Kein neues Modul und keine Parallelzuständigkeit.
- Keine Alert-DB-Migration und kein Ersatz von `broadcastWS`.
