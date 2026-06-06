# Changelog – VIP30 / 30TageVIP

## 2026-06-06 – STEP8.11 Alert Bus Event

### Geändert

- `backend/modules/vip30.js`
  - Version auf `0.8.7` gesetzt.
  - Build auf `step8.11-alert-bus-event` gesetzt.
  - Emits-Liste um `vip30.alert` ergänzt.
  - Alert-Bus-Payload nach erfolgreichem VIP30-Live-Flow ergänzt.
  - Runtime-Alert-Stats ergänzt.
  - Read-only Route `/api/vip30/alert/status` ergänzt.

### Nicht geändert

- Kein Dashboard.
- Kein Overlay.
- Kein Sound-Modul.
- Kein Twitch-Modul.
- Keine DB-Migration.

### Safety

Alert-Bus-Event wird nur nach Erfolg erzeugt und nur wenn `live.allowAlert === true`.
