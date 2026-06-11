# NEXT STEPS – LWG-4O.3b

## Soforttest

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/chat-claim/status" | ConvertTo-Json -Depth 10
```

```powershell
powershell -ExecutionPolicy Bypass -File .\LWG-4O3_full_claim_test_ForrestCGN.ps1 -ClaimTimeoutSeconds 120
```

## Erfolgskriterien

- `moduleBuild = STEP_LWG_4O_3b`
- `lastUserLogin = forrestcgn`
- `matched` steigt.
- `confirmed` steigt.
- Winner-Metadata enthält `chatClaim.status = confirmed`.

## Danach

LWG-4O.4 planen/umsetzen:

- Optionaler Claim-Zwang im Giveaway-Setup.
- Nach Draw automatisch Claim-Fenster öffnen.
- Bei Wheel-Giveaway Wheel-Permission erst nach bestätigtem Claim aktivieren.
- Timeout/Nichtmeldung sauber behandeln.
