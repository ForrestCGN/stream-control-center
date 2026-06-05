# VIP30 / 30 Tage VIP

## Stand: STEP8 Live-Action-Plan mit Safety-Gates

Version: `0.8.0`  
Build: `step8-live-action-plan-safety-gates`

STEP8 bereitet den echten Live-Ablauf vor, schaltet ihn aber noch nicht scharf. Der bestätigte STEP7/STEP7.2-Stand bleibt erhalten:

- Twitch-Reward `30 Tage VIP` ist lokal als `vip30` verknüpft.
- Testkosten stehen auf `1` Kanalpunkt.
- EventSub-Redemptions kommen im VIP30-Modul an.
- VIP30-Decision und DB-Log funktionieren.
- `ensure` läuft wieder fehlerfrei.

## Neue STEP8-Routen

### Live-Safety prüfen

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/live/check"
$r.status
$r.armed
$r.blockers
```

Erwartung direkt nach STEP8: `live_actions_locked`, `False`.

### Live-Aktionsplan erzeugen

```powershell
$body = @{
  userId = "123"
  userLogin = "testuser"
  userDisplayName = "TestUser"
  twitchRewardId = "5932e698-9a57-4d13-9acc-c397682c10a6"
  twitchRedemptionId = "test-redemption-id"
  source = "manual_live_plan_test"
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip30/redeem/live-plan" -ContentType "application/json" -Body $body
```

Der Plan zeigt, welche Aktionen später laufen würden:

- `twitch_add_vip`
- `create_vip30_slot`
- `twitch_redemption_fulfill`
- optional `trigger_vip30_alert`

Bei blockierten Einlösungen wird stattdessen `twitch_redemption_cancel` geplant.

## Safety

STEP8 führt weiterhin nichts aus:

- kein Twitch-Write
- kein VIP-Grant
- kein Slot-Write
- kein Fulfill
- kein Cancel

Die neuen Live-Gates stehen standardmäßig auf `false`:

- `live.enabled`
- `live.allowVipGrant`
- `live.allowSlotWrite`
- `live.allowRedemptionFulfillCancel`
- `live.allowAlert`
- `twitch.liveActionsEnabled`

Außerdem bleibt `bridge.decisionOnly` standardmäßig `true`.

## Nächster Schritt

STEP9 kann die echten Aktionen implementieren, aber erst nach separatem Go und nur hinter den Safety-Gates:

- Twitch Add VIP
- Slot speichern
- Redemption Fulfill bei Erfolg
- Redemption Cancel bei Blocker
- Alert/Sound nach Erfolg
