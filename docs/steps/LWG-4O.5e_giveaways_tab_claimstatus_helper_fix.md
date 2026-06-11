# STEP LWG-4O.5e – Giveaways Tab claimStatusLabel Fix

## Ziel

Hotfix für den Dashboard-Giveaways-Tab nach LWG-4O.5d.

## Änderung

- `claimStatusLabel(winner)` in `htdocs/dashboard/modules/loyalty_games.js` ergänzt.
- `statusLabel`, `getChatClaimSettings` und Direct-Navigation bleiben erhalten.
- Keine Backend-, Datenbank- oder Claim-Runtime-Änderung.

## Prüfung

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
```

Danach Live-Deploy/StepDone, Browser hart neu laden und `Loyalty -> Giveaways` öffnen.
