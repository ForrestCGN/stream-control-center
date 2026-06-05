# VIP30 Modul

Stand: VIP30-STEP8.3 / Version 0.8.3

## Zweck

Das VIP30-Modul verarbeitet die Twitch-Kanalpunkte-Belohnung `30 Tage VIP` vollständig im Node-System.

## Aktueller STEP8.3-Stand

STEP8.3 aktiviert die erste echte Live-Stufe **Stage A**:

- echte Twitch-Redemption wird über EventSub erkannt
- VIP30-Bridge matched den lokalen `vip30`-Reward
- bei `eligible` und gesetzten Stage-A-Gates wird Twitch `Add VIP` ausgeführt
- danach wird ein aktiver VIP30-Slot in `vip30_slots` gespeichert
- Log-Eintrag wird in `vip30_log` geschrieben

Weiterhin gesperrt:

- kein Redemption Fulfill
- kein Redemption Cancel
- kein Alert

## Wichtige Routen

- `GET /api/vip30/status`
- `GET /api/vip30/live/check`
- `GET /api/vip30/live/stage-a/check`
- `GET /api/vip30/live/arm-preview`
- `POST /api/vip30/live/set-gates?confirm=YES&profile=stage_a`
- `POST /api/vip30/redeem/live-stage-a`
- `POST /api/vip30/redeem/live-plan`
- `GET /api/vip30/slots`
- `GET /api/vip30/logs`

## Safety

Stage A benötigt diese Gates:

- `live.enabled = true`
- `live.mode = live`
- `twitch.liveActionsEnabled = true`
- `bridge.decisionOnly = false`
- `live.allowVipGrant = true`
- `live.allowSlotWrite = true`
- Twitch Capability muss ready sein
- lokaler Reward muss mit Twitch Reward ID verknüpft sein

`live.allowRedemptionFulfillCancel` und `live.allowAlert` bleiben in STEP8.3 bewusst `false`.


## VIP30 STEP8.3.1
- Version 0.8.3.1 / build step8.3.1-stage-a-preflight-refresh-diagnostics.
- Stage-A Live-Ausfuehrung aktualisiert vor dem VIP-Grant Capability und Config frisch.
- Block-Logs enthalten nun konkrete Stage-A-Blocker.
- Fulfill/Cancel und Alert bleiben weiterhin deaktiviert.
