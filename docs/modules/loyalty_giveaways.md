# Loyalty Giveaways Modul

Stand: 2026-06-08  
STEP: LWG-4J.2

## Fix

Wheel-Claim-Routen werden jetzt sicher registriert:

```text
GET  /api/loyalty/giveaways/:giveawayUid/wheel/permissions
POST /api/loyalty/giveaways/:giveawayUid/wheel/claim
```

Die Draw-Logik und Permission-Erzeugung aus LWG-4J bleiben unverändert.
