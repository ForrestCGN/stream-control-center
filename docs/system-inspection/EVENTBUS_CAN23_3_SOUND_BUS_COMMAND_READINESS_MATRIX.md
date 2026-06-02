# EVENTBUS CAN-23.3 - Sound Bus Command Readiness Matrix

## Zweck

CAN-23.3 erweitert die read-only Bus-Integration-Matrix um den Sound-Bus-Command-Status.

## Geaendert

```text
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neu ausgewertet

```text
GET /api/sound/eventbus/command/status
```

Dadurch zeigt die Bus-Matrix beim Sound-System jetzt zusaetzlich:

```text
Command-Route
Command-OK
Command-Feature
Command-Mode
Dry-Run verfuegbar
Play-Test verfuegbar
Queue-Touch erlaubt
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
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Beide Syntax-Checks waren erfolgreich.
