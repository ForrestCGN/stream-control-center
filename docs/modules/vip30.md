# VIP30 Modul

Stand: VIP30-STEP8.4 / Version 0.8.4

## Zweck

Das VIP30-Modul verarbeitet die Twitch-Kanalpunkte-Belohnung `30 Tage VIP` vollständig im Node-System.

## Aktueller STEP8.4-Stand

STEP8.4 aktiviert die zweite echte Live-Stufe **Stage B**:

- echte Twitch-Redemption wird über EventSub erkannt
- VIP30-Bridge matched den lokalen `vip30`-Reward
- bei `eligible` und gesetzten Stage-B-Gates wird Twitch `Add VIP` ausgeführt
- danach wird ein aktiver VIP30-Slot in `vip30_slots` gespeichert
- die Redemption wird bei Erfolg auf `FULFILLED` gesetzt
- bei fachlicher Ablehnung wird die Redemption auf `CANCELED` gesetzt
- Log-Eintrag wird in `vip30_log` geschrieben

Weiterhin gesperrt:

- kein Alert

## Wichtige Routen

- `GET /api/vip30/status`
- `GET /api/vip30/live/check`
- `GET /api/vip30/live/stage-a/check`
- `GET /api/vip30/live/stage-b/check`
- `GET /api/vip30/live/arm-preview`
- `GET /api/vip30/live/arm-settings-preview?profile=stage_b`
- `POST /api/vip30/live/set-gates?confirm=YES&profile=stage_b`
- `POST /api/vip30/redeem/live-stage-a`
- `POST /api/vip30/redeem/live-plan`
- `GET /api/vip30/slots`
- `GET /api/vip30/logs`

## Safety

Stage B benötigt diese Gates:

- `live.enabled = true`
- `live.mode = live`
- `twitch.liveActionsEnabled = true`
- `bridge.decisionOnly = false`
- `live.allowVipGrant = true`
- `live.allowSlotWrite = true`
- `live.allowRedemptionFulfillCancel = true`
- Twitch Capability muss ready sein
- lokaler Reward muss mit Twitch Reward ID verknüpft sein

`live.allowAlert` bleibt in STEP8.4 bewusst `false`.

## VIP30 STEP8.4

- Version 0.8.4 / build `step8.4-stage-b-redemption-fulfill-cancel`.
- Stage-B Live-Ausführung erfüllt erfolgreiche Redemptions nach VIP-Grant + Slot-Write.
- Fachlich blockierte Redemptions werden canceled/refunded.
- Alert bleibt weiterhin deaktiviert.
