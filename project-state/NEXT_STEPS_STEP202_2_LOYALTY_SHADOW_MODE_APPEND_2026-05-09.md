# NEXT STEPS APPEND - STEP202.2

## Nächster technischer Schritt

### STEP203 - Loyalty Core DB + Basis-API Shadow Mode

Der StreamElements-Punkteimport ist kein Blocker mehr.

Geplanter Startumfang:

```text
backend/modules/loyalty.js
config/loyalty.json als Seed/Fallback
DB-Tabellen fuer Loyalty Core
/api/loyalty/status
/api/loyalty/settings
/api/loyalty/balance/:login
/api/loyalty/transactions
Shadow-Mode-Settings
```

Startmodus:

```text
loyalty.mode = shadow
loyalty.publicCommandsEnabled = false
loyalty.watchEarningEnabled = true
loyalty.eventBonusesEnabled = false oder spaeter testweise true
loyalty.rewardsEnabled = false
loyalty.giveawaysEnabled = false
loyalty.gamesEnabled = false
```

StreamElements bleibt aktiv.
Kein produktiver Import in STEP203.
