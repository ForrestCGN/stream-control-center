# LWG-4O.3b Testbefehle

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/chat-claim/status" | ConvertTo-Json -Depth 10
```

```powershell
powershell -ExecutionPolicy Bypass -File .\LWG-4O3_full_claim_test_ForrestCGN.ps1 -ClaimTimeoutSeconds 120
```

Während das Script wartet, als `ForrestCGN` irgendeine Nachricht in den Twitch-Chat schreiben.

Bei Erfolg sollte im Status erkennbar sein:

```text
lastUserLogin = forrestcgn
lastUserDisplayName = ForrestCGN
matched >= 1
confirmed >= 1
```
