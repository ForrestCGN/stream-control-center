# EVENTBUS CAN-23.9 - Alert Bus ACK Status read-only

## Zweck

CAN-23.9 macht Alert-Request, Overlay-ACK, Sound-ACK und Finish-ACK read-only sichtbar.

## Geaendert

```text
backend/modules/alert_system.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue read-only Route

```text
GET /api/alerts/eventbus/ack-status
```

## Die Route zeigt

```text
alert_request
overlay_ack
sound_ack
finish_ack
overlayRows
overlayAcknowledged
overlayMissing
soundMatched
watchdogMissingFinishAck
```

## Sicherheitsgrenze

```text
read-only
kein Alert-Replay
keine Queue-Mutation
kein Sound
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
