# LWG-4O.4 Testbefehle

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/chat-claim/status" | ConvertTo-Json -Depth 10
```

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\tests\LWG-4O4_auto_claim_test_ForrestCGN.ps1 -ClaimTimeoutSeconds 120
```

Erwartung:

- Draw liefert `chatClaimRequired=true`.
- Direkt nach Draw ist `claimWindow.status=pending`.
- Bei Wheel-Giveaway ist vor Chatmeldung noch keine verwendbare Wheel-Permission nötig.
- Nach Twitch-Chatnachricht von ForrestCGN wird `metadata.chatClaim.status=confirmed`.
- Danach wird eine Wheel-Permission erstellt und der Spin kann ausgelöst werden.
