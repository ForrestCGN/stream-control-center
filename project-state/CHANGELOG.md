# CHANGELOG – VIP30 STEP8.5

## 0.8.5

- Neue Route `GET /api/vip30/cleanup/check`.
- Neue Route `POST /api/vip30/cleanup/run`.
- Twitch Remove VIP für abgelaufene aktive VIP30-Slots vorbereitet.
- Slots werden auf `expired` gesetzt, nicht gelöscht.
- Fehlerfälle werden als `failed` markiert und geloggt.
- Safety: kein Alert, kein Redemption-Fulfill/Cancel im Cleanup.
