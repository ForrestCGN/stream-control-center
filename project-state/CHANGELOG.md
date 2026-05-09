# Changelog

## 2026-05-09

### STEP203.3 - Loyalty Stream-State Gate + Presence Run-Once

- `backend/modules/loyalty.js` auf Version `0.1.2` erhöht.
- Loyalty-Schema auf Version `3` erhöht.
- Neue Tabelle:
  - `loyalty_stream_state`
- Neue Settings:
  - `streamState.*`
  - `presence.*`
- Neue Routen:
  - `GET/POST /api/loyalty/stream-state/start`
  - `GET/POST /api/loyalty/stream-state/stop`
  - `GET/POST /api/loyalty/stream-state/clear-override`
  - `GET/POST /api/loyalty/stream-state/refresh-auto`
  - `GET /api/loyalty/presence/status`
  - `GET/POST /api/loyalty/presence/run-once`
- Live-Gate ergänzt:
  - offline keine Watch-Punkte
  - manueller Streamer.bot-Fallback möglich
  - Twitch Auto-Live-Status vorbereitet
- Noch kein automatischer Timer.

### STEP203.2 - Twitch Presence Activity Collector

- Twitch Presence Activity Collector eingeführt.
