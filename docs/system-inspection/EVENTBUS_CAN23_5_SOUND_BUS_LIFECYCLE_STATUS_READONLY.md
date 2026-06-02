# EVENTBUS CAN-23.5 - Sound Bus Lifecycle Status read-only

## Zweck

CAN-23.5 macht den Sound-Bus-Lifecycle-/ACK-Status read-only sichtbar.

## Geaendert

```text
backend/modules/sound_system.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue read-only Route

```text
GET /api/sound/eventbus/command/lifecycle
```

## Canonical Lifecycle

```text
accepted
queued
started
failed
finished
timeout
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
```

## Tests

```bat
node -c backend\modules\sound_system.js
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Alle Syntax-Checks waren erfolgreich.
