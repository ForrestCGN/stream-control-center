# CHANGELOG

## STEP416 – Alert EventBus Baseline

- `backend/modules/alert_system.js` erweitert.
- Modulversion für EventBus-Status: `3.1.0`.
- Neue Alert EventBus Capability: `alert.event_output`.
- Neue Status-API-Version: `1.0.0`.
- Neue Routen:
  - `GET /api/alerts/eventbus/status`
  - `GET /api/alerts/eventbus/test`
  - `GET /api/alerts/eventbus/reset`
- `buildStatus()` enthält jetzt `alertEventBus`.
- Alert-Config kennt jetzt `alertEventBus`.
- Test-Route sendet ein `alert.status` / `test` Event ohne Queue, Sound-System oder Overlay zu berühren.
- Legacy Alert-Overlay-Flow bleibt unverändert.
- Alert-Sound-/TTS-Bundle-Flow bleibt unverändert.
