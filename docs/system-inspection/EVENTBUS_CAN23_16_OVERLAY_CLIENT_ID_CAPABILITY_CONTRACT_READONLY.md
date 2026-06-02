# EVENTBUS CAN-23.16 - Overlay Client ID/Capability Contract read-only

## Zweck

CAN-23.16 macht Overlay-Client-IDs und Capabilities vereinheitlicht sichtbar.

## Geaendert

```text
backend/modules/overlay_monitor.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue read-only Route

```text
GET /api/overlay-monitor/client-control/identity-contract
```

## Die Route zeigt

```text
normalizedId: overlay:<stable-id>
module
clientType
capabilities
recommendedEventSource
recommendedHeartbeatPayload
duplicate normalized IDs
capabilityCounts
```

## Sicherheitsgrenze

```text
read-only
keine Client-Umbenennung
keine Overlay-Aenderung
keine OBS-Aktion
kein Browser-Source-Refresh
keine Reparatur
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
