# CURRENT_STATUS

## Stand: CAN-23.13 abgeschlossen

CAN-23.13 hat Overlay-Clients/Heartbeat als Kontrollsicht read-only sichtbar gemacht.

## Neu

```text
GET /api/overlay-monitor/client-control/status
```

## Sicherheitsstatus

```text
readOnly: true
obsRefresh: false
obsRepair: false
browserSourceRefresh: false
eventBusEmit: false
recoveryExecution: false
```

## Naechster Schritt

```text
Channelpoints: Rewards nach Sound/Alert schrittweise ueber Bus-Requests fuehren.
```
