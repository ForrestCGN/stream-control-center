# EVENTBUS CAN-23.10 - Alert Bus Command Contract read-only

## Zweck

CAN-23.10 macht den Alert-Bus-Command-Vertrag read-only sichtbar.

## Geaendert

```text
backend/modules/alert_system.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue read-only Route

```text
GET /api/alerts/eventbus/command/contract
```

## Der Contract beschreibt

```text
command: alert.request
Pflichtfelder
empfohlene Felder
optionale Felder
requestId / correlationId / source / requestedBy
Lifecycle: alert_request, overlay_ack, sound_ack, finish_ack, failed, timeout
Result-Felder
Korrelationsfelder
ACK-Planung
Sicherheitsgrenzen
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
