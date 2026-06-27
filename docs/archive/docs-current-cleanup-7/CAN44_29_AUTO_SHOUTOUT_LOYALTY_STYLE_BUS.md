# CAN44.29 AutoShoutout Loyalty-Style Bus Subscriber

Zielpfad beim Entpacken ab Repo-Root:

- backend/modules/clip_shoutout.js

Änderungen:

- clip_shoutout Modulversion 0.2.45.
- AutoShoutout-Subscriber an den funktionierenden loyalty_giveaways-Subscriber-Stil angeglichen.
- Subscription nutzt channel=twitch.chat, action=message, capability=twitch.chat.message.
- Subscription-ID auf clip_shoutout:twitch.chat:message:auto_shoutout vereinheitlicht.
- Chat-Envelope-Normalisierung robuster gemacht und an loyalty_giveaways orientiert.
- Direct-Wrapper bleibt als Fallback erhalten.
- Keine bestehende Funktionalität entfernt.

Test:

```powershell
cd D:\Git\stream-control-center
node -c .\backend\modules\clip_shoutout.js

$b = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
$b.status.subscriptions | Where-Object { $_.id -like "clip_shoutout*" -or $_.id -like "loyalty_giveaways*" -or $_.id -like "commands:*" } | Select-Object id,channel,action,capability,delivered,errors,lastDeliveredAt

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s.autoShoutout.state.busSubscriber
$s.state.stats | Select-Object autoBusReceived,autoBusDelivered,autoBusErrors,autoTriggered,autoSkipped
```

StepDone:

```cmd
.\stepdone.cmd "CAN44.29 AutoShoutout Loyalty-Style Bus Subscriber"
```
