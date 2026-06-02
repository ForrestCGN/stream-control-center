# CURRENT_STATUS

## Stand: CAN-24.0 abgeschlossen

CAN-24.0 hat Sound-Migrationskandidaten read-only vorbereitet.

## Neu

```text
GET /api/channelpoints/bus/sound-migration-candidates
```

## Sicherheitsstatus

```text
readOnly: true
soundTouched: false
dryRunExecuted: false
queueTouched: false
rewardExecuted: false
redemptionChanged: false
twitchTouched: false
productiveMigration: false
eventBusEmit: false
```

## Naechster Schritt

```text
CAN-24.1: Ausgewaehlten Kandidaten gegen /api/sound/eventbus/command/dry-run validierbar machen.
```
