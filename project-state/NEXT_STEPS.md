# Next Steps

## Nach Entpacken von VIP30-STEP3

```powershell
cd /d D:\Git\stream-control-center
node -c backend\modulesip30.js
.\stepdone.cmd "VIP30-STEP3 Channelpoints Reward Link 40000"
```

## Nach Serverstart testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/channelpoints/reward/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip30/channelpoints/reward/ensure?confirm=YES" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/channelpoints/reward/status" | ConvertTo-Json -Depth 8
```

## Danach

VIP30-STEP4 planen:

- VIP30-Decision-Flow fuer Redemption vorbereiten.
- Pruefen: Slots voll, bestehender VIP30-Slot, bestehender Twitch-VIP, Moderator, Token/API-Fehler.
- Nur Dry-/Decision-Ausgabe und Logging.
- Noch kein Add VIP.
- Noch kein Fulfill/Cancel.
