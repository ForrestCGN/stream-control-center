# CHANGELOG

## STEP417 – Alert EventBus Debug Consumer

- `htdocs/public/tools/alert_eventbus_debug.html` ergänzt.
- Browser-Tool registriert sich als echter Communication-Bus-Client mit Capability `alert.event_output`.
- Erwarteter Client: `alert_eventbus_debug`, Modul `alert_system`, Version `1.0.0`, Mode `debug`.
- Dient nur Diagnose/Beobachtung. Keine Änderung an Alert-Queue, Sound-System, Bundle/TTS, Overlay oder bestehenden Alert-Routen.

## STEP416 – Alert EventBus Baseline

- `backend/modules/alert_system.js` um Alert EventBus Status/Test/Reset ergänzt.
- Neue Routen: `/api/alerts/eventbus/status`, `/api/alerts/eventbus/test`, `/api/alerts/eventbus/reset`.
- Capability `alert.event_output`, Status-API `1.0.0`, Channel `alert.status`.
