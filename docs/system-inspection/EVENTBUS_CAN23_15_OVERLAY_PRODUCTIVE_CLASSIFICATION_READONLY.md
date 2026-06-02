# EVENTBUS CAN-23.15 - Overlay Productive/Test Classification read-only

## Zweck

CAN-23.15 macht produktive Overlays von Test-/Alt-Overlays in der Matrix unterscheidbar.

## Geaendert

```text
backend/modules/overlay_monitor.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue read-only Route

```text
GET /api/overlay-monitor/client-control/classification
```

## Die Route zeigt

```text
productive_candidate
test_or_legacy
unknown
confidence
matched tokens
```

## Sicherheitsgrenze

```text
read-only
keine OBS-Aktion
kein Browser-Source-Refresh
keine Reparatur
kein Ausblenden
kein Entfernen
kein EventBus-Emit
keine Recovery/Selbstheilung
```

## Hinweis

Die Klassifikation ist ein erster token-basierter Hinweis und darf nicht automatisch fuer Cleanup/Ausblenden/Loeschen verwendet werden.

## Tests

```bat
node -c backend\modules\overlay_monitor.js
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Alle Syntax-Checks waren erfolgreich.
