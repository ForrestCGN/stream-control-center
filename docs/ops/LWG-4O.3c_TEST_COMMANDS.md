# LWG-4O.3c Test Commands

## Syntax

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

## Claim-Status

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/chat-claim/status" | ConvertTo-Json -Depth 10
```

## Kompletttest mit ForrestCGN

```powershell
powershell -ExecutionPolicy Bypass -File .\LWG-4O3_full_claim_test_ForrestCGN.ps1 -ClaimTimeoutSeconds 120
```

Während das Script wartet, als ForrestCGN eine normale Twitch-Chatnachricht schreiben.

## Erwartung

```text
lastUserLogin = forrestcgn
lastUserDisplayName = ForrestCGN
matched >= 1
confirmed >= 1
```

Beim Winner:

```text
metadata.chatClaim.status = confirmed
```
