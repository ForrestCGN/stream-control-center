# LWG-4O.3 – Testbefehle

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/chat-claim/status" | ConvertTo-Json -Depth 10
```

```powershell
$giveawayUid = "<giveaway_uid>"
$winnerUid = "<winner_uid>"
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/winners/$winnerUid/claim/open" -ContentType "application/json" -Body '{"timeoutSeconds":60,"actor":"dashboard-test"}' | ConvertTo-Json -Depth 10
```

Dann im Twitch-Chat als Gewinner schreiben.

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/winners" | ConvertTo-Json -Depth 10
```
