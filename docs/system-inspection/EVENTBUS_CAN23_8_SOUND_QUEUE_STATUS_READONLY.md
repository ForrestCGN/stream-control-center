# EVENTBUS CAN-23.8 - Sound Queue Status read-only

## Zweck

CAN-23.8 macht den Sound-Queue-Status fuer die Bus-Matrix read-only sichtbar.

## Geaendert

```text
backend/modules/sound_system.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue read-only Route

```text
GET /api/sound/eventbus/command/queue-status
```

## Die Route zeigt

```text
current
parallel
queue
busy/idle
queuedCount
maxLength
full
currentRequestId
currentSoundId
activeBundleLock
stats
```

## Sicherheitsgrenze

```text
read-only
kein Sound wird abgespielt
keine Queue wird veraendert
kein Dry-Run wird ausgefuehrt
kein Play-Test wird ausgefuehrt
kein EventBus-Emit
keine Recovery
kein Queue-Clear
```

## Tests

```bat
node -c backend\modules\sound_system.js
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Alle Syntax-Checks waren erfolgreich.
