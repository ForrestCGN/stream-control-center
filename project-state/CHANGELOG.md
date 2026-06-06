# Changelog – VIP30 / 30TageVIP

## 2026-06-06 – STEP8.18 Alert-Test

### Backend

- `backend/modules/vip30.js`
  - Version `0.8.12`
  - Build `step8.18-alert-test-route`
  - neuer Endpunkt `POST /api/vip30/alert/test`
  - manueller Test baut Fake-VIP30-Erfolg ohne Twitch-/Slot-Schreibaktion
  - nutzt den echten `triggerVip30AlertSoundBundle()` Pfad

### Dashboard

- `htdocs/dashboard/modules/vip30.js`
  - Button `VIP30 Alert testen` im Tab `Aktionen`
  - zeigt gewählten Sound und gewähltes Textset an

- `htdocs/dashboard/modules/vip30.css`
  - kleine Hervorhebung für Test-Aktion

### Nicht geändert

- Sound-System
- Media-System
- Sound-System-Overlay
