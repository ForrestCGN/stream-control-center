# Changelog

## 2026-05-26 — channelpoints v0.6.0 media-execution-bridge

- `channelpoints` von `0.5.0` auf `0.6.0` erhöht.
- Build-Kennung `media-execution-bridge` ergänzt.
- Medien-Rewards können lokal über `/api/sound/play` ausgeführt werden.
- Neue Diagnose-Routen:
  - `GET /api/channelpoints/rewards/:idOrKey/execution-check`
  - `GET /api/channelpoints/media-execution-check?reward=<keyOderId>`
- Neue Ausführungs-Routen:
  - `POST /api/channelpoints/rewards/:idOrKey/execute`
  - `GET/POST /api/channelpoints/execute`
- Keine Twitch-Schreibzugriffe eingeführt.
- Keine bestehende Funktionalität entfernt.
