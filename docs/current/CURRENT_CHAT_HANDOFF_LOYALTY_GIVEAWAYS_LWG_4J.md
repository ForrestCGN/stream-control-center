# CURRENT CHAT HANDOFF – Loyalty Giveaways LWG-4J

Stand: 2026-06-08

## Neuer Stand

```text
STEP LWG-4J – Giveaway Wheel Claim
```

## Neu

```text
loyalty_giveaway_wheel_permissions
GET  /api/loyalty/giveaways/:giveawayUid/wheel/permissions
POST /api/loyalty/giveaways/:giveawayUid/wheel/claim
```

## Ablauf

```text
1. Wheel-Giveaway draw -> Gewinner + pending wheel permission.
2. Gewinner claimt Rad.
3. loyalty_games.startWheelSpin startet echten Wheel-Spin.
4. Ergebnis wird beim Winner gespeichert.
5. Permission wird used.
6. Giveaway wird finished.
```
