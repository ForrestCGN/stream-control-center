# Next Steps

## VIP30-STEP2

Twitch Capability Check bauen/prüfen:

```text
- Token vorhanden
- broadcaster_id vorhanden
- channel:manage:redemptions vorhanden
- channel:manage:vips vorhanden
- token user passt zum Broadcaster
```

## VIP30-STEP3

Channelpoints-Execution erweitern:

```text
- Reward action_type=vip30/action_key=vip30.redeem erkennen
- an backend/modules/vip30.js delegieren
- noch kein generischer unsicherer Route-Executor
```

## VIP30-STEP4

Dry-Run fuer Redemptions:

```text
- EventSub-Redemption wird erkannt
- VIP30 prueft Regeln
- Ergebnis: would_grant / would_cancel_reason
- kein Twitch Add VIP
- kein Fulfill/Cancel
```
