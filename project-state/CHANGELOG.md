# CHANGELOG - VIP30

## 0.8.0 - STEP8 Live-Action-Plan Safety-Gates

- Neue Live-Safety-Konfiguration ergänzt.
- Neue Route `GET /api/vip30/live/check`.
- Neue Route `POST /api/vip30/redeem/live-plan`.
- Live-Plan zeigt geplante Aktionen für Eligible/Blocked-Fälle.
- DB-Log-Event `live_action_plan` ergänzt.
- EventBus-Event `vip30.live / plan` ergänzt.
- Keine echte Live-Aktion wird ausgeführt.

## 0.7.2

- `ensure`-Route: `created_at` Parameterfehler repariert.

## 0.7.1

- Twitch Reward ID lokal verknüpfbar gemacht.
