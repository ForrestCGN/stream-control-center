# EVENTBUS CAN-23.4 - Sound Bus Command Contract read-only

## Zweck

CAN-23.4 macht den Sound-Bus-Command-Vertrag im Sound-System selbst sichtbar.

## Geaendert

```text
backend/modules/sound_system.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue read-only Route

```text
GET /api/sound/eventbus/command/contract
```

## Der Contract beschreibt

```text
command: sound.play.request
Pflichtfelder
empfohlene Felder
optionale Felder
Request-ID / Source / RequestedBy
Lifecycle: accepted, queued, started, failed, finished, timeout
Result-Felder
Queue-Status-Felder
ACK-Planung
Sicherheitsgrenzen
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
