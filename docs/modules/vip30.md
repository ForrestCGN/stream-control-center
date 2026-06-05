# VIP30 / 30 Tage VIP

## Aktueller Stand: STEP6 Channelpoints Decision Bridge

Version: `0.6.1`  
Build: `step6.1-status-routecount-cleanup`

## Grundregeln

- Node-only, kein Streamer.bot.
- Aktive Datenbank bleibt `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- JSON `config/vip30.json` ist nur Seed/Fallback; primäre Konfiguration liegt in `vip30_settings`.
- Reward-Kosten: `40000` Kanalpunkte.
- Max Slots: `10`.
- Laufzeit: `30` Tage.
- Kein Import aus alten JSON-Dateien.

## Tabellen

- `vip30_slots`
- `vip30_log`
- `vip30_settings`

## API

- `GET /api/vip30/status`
- `GET /api/vip30/health`
- `GET /api/vip30/slots`
- `GET /api/vip30/logs`
- `GET /api/vip30/stats`
- `GET /api/vip30/settings`
- `POST /api/vip30/settings/save`
- `GET /api/vip30/twitch/capability`
- `GET /api/vip30/twitch/scopes`
- `GET /api/vip30/channelpoints/reward/status`
- `POST /api/vip30/channelpoints/reward/ensure?confirm=YES`
- `GET /api/vip30/redeem/dry-run`
- `POST /api/vip30/redeem/dry-run`
- `POST /api/vip30/redeem/decision`
- `GET /api/vip30/channelpoints/bridge/status`
- `POST /api/vip30/channelpoints/bridge/test`

## STEP6

STEP6 ergänzt eine additive interne Bridge intern in `backend/modules/vip30.js`.

Die Bridge hört auf den Communication-Bus:

- Channel: `channelpoints.redemption`
- Action: `received`

Wenn die Redemption als VIP30 erkannt wird, ruft die Bridge nur die VIP30-Decision auf.

## Safety in STEP6

- Kein Add VIP.
- Kein Remove VIP.
- Kein Slot-Write.
- Kein Fulfill.
- Kein Cancel.
- Kein Streamer.bot.
- Nur Entscheidung, Logging und Bus-Events.


## VIP30-STEP6.1 Cleanup

Status und RouteCount wurden bereinigt. Keine neue Zusatzdatei, keine Funktionsänderung, keine Live-Aktionen.
