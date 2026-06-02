# CURRENT_STATUS

## Stand: CAN-23.12 abgeschlossen

CAN-23.12 hat VIP-Sound-Overlay Show/Update/Hide/ACK read-only sichtbar gemacht.

## Neu

```text
GET /api/vip-sound/eventbus/overlay/status
```

## Sicherheitsstatus

```text
readOnly: true
vipOverlayReset: false
queueTouched: false
soundTouched: false
overlaySend: false
eventBusEmit: false
recoveryExecution: false
```

## Naechster Schritt

```text
Overlay-Monitor: Overlay-Clients/Heartbeat als Kontrollsicht fuer aktive Szenen nutzen.
```
