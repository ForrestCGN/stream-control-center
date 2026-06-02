# EVENTBUS CAN-23.7 - Sound Play Bus Compatibility read-only

## Zweck

CAN-23.7 macht sichtbar, wie kompatibel die produktive `/api/sound/play`-Logik mit dem geplanten Bus-Request `sound.play.request` ist.

## Geaendert

```text
backend/modules/sound_system.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue read-only Route

```text
GET /api/sound/eventbus/command/play-compatibility
```

## Die Route zeigt

```text
produktiver Entry-Point: /api/sound/play
Bus-Command: sound.play.request
gemeinsamer Normalizer: normalizePlayRequest
Queue-Entry-Point: enqueueOrStart
kompatible Felder
Result-Felder
Lifecycle-Mapping
Queue-Policy
Migrations-Sicherheitsregeln
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
