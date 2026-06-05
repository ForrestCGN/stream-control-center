# VIP30 / 30 Tage VIP

## Aktueller Stand: STEP7 EventSub Live-Dry-Run Observe

Version: `0.7.0`  
Build: `step7-eventsub-live-dryrun-observe`

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
- `GET /api/vip30/channelpoints/bridge/live-check`
- `POST /api/vip30/channelpoints/bridge/reset-stats`

## STEP7

STEP7 bereitet den Test mit einer echten Twitch/EventSub-Channelpoints-Redemption vor, bleibt aber weiterhin im reinen Decision-/Dry-Run-Modus.

Die interne VIP30-Bridge hört weiterhin auf den Communication-Bus:

- Channel: `channelpoints.redemption`
- Action: `received`

Neue Diagnose-Endpunkte:

- `GET /api/vip30/channelpoints/bridge/live-check` prüft, ob die Bridge bereit ist, echte EventSub-Redemptions im Dry-Run zu beobachten.
- `POST /api/vip30/channelpoints/bridge/reset-stats` setzt nur Runtime-Zähler der Bridge zurück, löscht aber keine DB-Logs.

## Safety in STEP7

- Kein Add VIP.
- Kein Remove VIP.
- Kein Slot-Write.
- Kein Fulfill.
- Kein Cancel.
- Echte EventSub-Events werden nur beobachtet und geloggt.

## STEP7.2 - Ensure-/Twitch-Reward-ID-Fix

Stand: 0.7.2 (`step7.1-ensure-twitch-reward-id-fix`)

- Repariert `/api/vip30/channelpoints/reward/ensure`, damit der lokale Reward auch im Update-Fall sauber synchronisiert wird.
- Der SQL-Parameter `twitch_reward_id` wird nun im UPDATE genutzt und vorhandene Twitch-Reward-IDs bleiben erhalten.
- Neuer lokaler Link-Endpunkt: `POST /api/vip30/channelpoints/reward/link-twitch-id?confirm=YES`.
- Der Link-Endpunkt kann die Twitch-Reward-ID aus dem neuesten VIP30-DryRun-Log übernehmen oder explizit per Body/Query erhalten.
- Echte EventSub-DryRun-Events können die Twitch-Reward-ID lokal automatisch hinterlegen, ohne Twitch-Write.

Safety bleibt unverändert: kein VIP-Grant, kein Slot-Write, kein Fulfill/Cancel, kein Twitch-Write.


### STEP7.2
Ensure-Route endgültig für bestehende Rewards repariert: `created_at` wird nur beim INSERT verwendet, nicht mehr beim UPDATE. Safety bleibt DB-only.
