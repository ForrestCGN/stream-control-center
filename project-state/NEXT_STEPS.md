# Next Steps

## Aktuell

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Syntax prüfen.
3. `stepdone.cmd` ausführen.
4. Erst danach API-Tests.

```powershell
node -c backend\modules\vip30.js
.\stepdone.cmd "VIP30-STEP2 Twitch Capability Check"
```

Danach:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/twitch/capability" | ConvertTo-Json -Depth 8
```

## Danach geplant

VIP30-STEP3:

```text
Channelpoints-Reward vip30 sauber im bestehenden Channelpoints-System eintragen/prüfen.
Noch keine VIP-Livevergabe.
```

VIP30-STEP4:

```text
Dry-Run-Redemption: EventSub-Redemption wird erkannt und VIP30 entscheidet would_grant/would_cancel.
Noch kein Add VIP, kein Fulfill/Cancel.
```
