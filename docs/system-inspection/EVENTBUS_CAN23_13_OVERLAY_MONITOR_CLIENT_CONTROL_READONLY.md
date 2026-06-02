# EVENTBUS CAN-23.13 - Overlay Monitor Client Control read-only

## Zweck

CAN-23.13 macht Overlay-Clients/Heartbeat als Kontrollsicht fuer aktive Szenen read-only sichtbar.

## Geaendert

```text
backend/modules/overlay_monitor.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue read-only Route

```text
GET /api/overlay-monitor/client-control/status
```

## Die Route zeigt

```text
Overlay-Clients
Heartbeat
online/warning/error
stale/dead
productiveHint
testOrLegacyHint
Schwellwerte stale/dead
```

## Sicherheitsgrenze

```text
read-only
kein OBS-Refresh
keine OBS-Reparatur
kein Browser-Source-Refresh
kein EventBus-Emit
keine Recovery/Selbstheilung
```

## Tests

```bat
node -c backend\modules\overlay_monitor.js
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Alle Syntax-Checks waren erfolgreich.
