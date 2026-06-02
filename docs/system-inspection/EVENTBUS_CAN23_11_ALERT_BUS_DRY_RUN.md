# EVENTBUS CAN-23.11 - Alert Bus Dry-Run

## Zweck

CAN-23.11 ergaenzt einen Alert-Bus-Dry-Run, der Alert-Command-Payloads validiert, ohne produktive Aktionen auszufuehren.

## Geaendert

```text
backend/modules/alert_system.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue Route

```text
GET/POST /api/alerts/eventbus/command/dry-run
```

## Sicherheitsgrenze

```text
dry-run only
kein Alert-Replay
keine Queue-Mutation
kein Sound
kein Overlay-Send
kein Overlay-Recovery
kein EventBus-Emit
keine Recovery/Selbstheilung
```

## Tests

```bat
node -c backend\modules\alert_system.js
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Alle Syntax-Checks waren erfolgreich.
