# EVENTBUS CAN-23.17 - Legacy/direct paths read-only

## Zweck

CAN-23.17 markiert Legacy/direct REST-/broadcastWS-Wege pro Modul sichtbar in der Bus-Matrix.

## Geaendert

```text
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Sichtbar gemacht

```text
/api/sound/play
/api/alerts
broadcastWS/overlay
/api/vip-sound/enqueue
/api/vip-sound/client/*
/api/overlay-monitor/obs-source/action
/api/overlay-monitor/obs-inventory?refresh=1
/api/channelpoints/execute
/api/channelpoints/rewards/:idOrKey/execute
/api/channelpoints/eventsub/redemption
```

## Sicherheitsgrenze

```text
read-only
keine Route wird umgestellt
keine Legacy-Route wird ausgefuehrt
kein Sound
kein Alert
kein Overlay
kein OBS-Refresh
keine Reparatur
kein EventBus-Emit
keine Recovery/Selbstheilung
```

## Tests

```bat
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Alle Syntax-Checks waren erfolgreich.
