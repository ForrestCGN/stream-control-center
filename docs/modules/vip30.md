# VIP30 / 30 Tage VIP

Stand: **VIP30-STEP5** (`0.5.0`, `step5-dryrun-redemption-decision`)

## Ziel

VIP30 läuft vollständig im Node-/Stream-Control-Center-System. Streamer.bot wird nicht mehr benutzt.

## Aktueller Stand

- SQLite-Tabellen vorhanden: `vip30_slots`, `vip30_log`, `vip30_settings`
- DB-Settings sind Primärquelle; `config/vip30.json` ist nur Seed/Fallback
- Dashboardfähige Settings-API ist vorhanden
- Channelpoints-Reward `vip30` ist lokal verknüpft
- Kosten: **40.000 Kanalpunkte**
- Twitch-Capability-Check ist vorhanden
- Dry-Run-Redemption-/Decision-Flow ist vorhanden
- Keine Twitch-Schreibaktion in STEP5
- Kein Add VIP in STEP5
- Kein Fulfill/Cancel in STEP5

## Routen

- `GET /api/vip30/status`
- `GET /api/vip30/health`
- `GET /api/vip30/slots`
- `GET /api/vip30/logs`
- `GET /api/vip30/stats`
- `GET /api/vip30/twitch/capability`
- `GET /api/vip30/twitch/scopes`
- `GET /api/vip30/channelpoints/reward/status`
- `POST /api/vip30/channelpoints/reward/ensure?confirm=YES`
- `GET /api/vip30/settings`
- `POST /api/vip30/settings/save`
- `GET /api/vip30/redeem/dry-run`
- `POST /api/vip30/redeem/dry-run`
- `POST /api/vip30/redeem/decision`

## Dry-Run Decision

Der Dry-Run prüft ohne Live-Aktion:

- Modul aktiv/inaktiv
- Userdaten vorhanden
- bestehender aktiver VIP30-Slot
- Moderator-Block
- bestehender VIP-Block
- Slot-Kapazität
- ob theoretisch VIP gesetzt würde
- ob theoretisch Redemption fulfilled oder canceled würde
- ob theoretisch ein Alert ausgelöst würde

Er schreibt nur in `vip30_log` und sendet Bus-Events auf `vip30.redeem`.

## Sicherheit

STEP5 ist ausdrücklich nur Entscheidungslogik:

- `noTwitchWrite: true`
- `noVipGrant: true`
- `noSlotWrite: true`
- `noRedemptionFulfillCancel: true`

