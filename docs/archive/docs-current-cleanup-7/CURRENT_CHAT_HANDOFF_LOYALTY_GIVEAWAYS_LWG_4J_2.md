# CURRENT CHAT HANDOFF – Loyalty Giveaways LWG-4J.2

Stand: 2026-06-08

## Fix

```text
STEP LWG-4J.2 – Wheel Routes Registration Fix
```

## Problem

Draw funktionierte und erzeugte `wheelPermissionUid`, aber:

```text
Cannot GET /api/loyalty/giveaways/:giveawayUid/wheel/permissions
```

## Lösung

Wheel-Routen werden jetzt sicher in `registerRoutes` registriert.
