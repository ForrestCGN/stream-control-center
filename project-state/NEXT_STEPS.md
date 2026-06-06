# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06 09:20 UTC

## Direkt nach STEP8.8.1

- [ ] ZIP entpacken
- [ ] `stepdone.cmd "VIP30-STEP8.8.1 Dashboard CGN Design Polish"` ausführen
- [ ] Browser Hard Refresh
- [ ] Dashboard `Community -> 30 Tage VIP` optisch prüfen

## Danach: STEP8.9 planen

Thema:

```txt
VIP30 Dashboard Config Read/Write
```

Vor Code klären:

```txt
- Welche Einstellungen dürfen direkt bearbeitet werden?
- Welche gefährlichen Einstellungen bleiben gesperrt?
- Welche Aktionen brauchen Confirm?
- Welche Aktionen brauchen Audit?
- Welche Aktionen brauchen Owner/Admin?
```

## Kandidaten für harmlose Config

```txt
reward.title
reward.cost
slots.maxSlots
slots.durationDays
slots.blockModerators
slots.blockExistingVip
slots.blockExistingSlot
cleanup.enabled
cleanup.releaseSlotOnExternalVipRemove
logging.recentLimit
alerts.enabled
alerts.soundKey
alerts.durationMs
```

## Weiter gesperrt bis separat geplant

```txt
live.allowVipGrant
live.allowSlotWrite
live.allowRedemptionFulfillCancel
twitch.liveActionsEnabled
Cleanup Run
External VIP Remove Process
VIP manuell vergeben
VIP manuell entziehen
Redemption fulfill/cancel
```
