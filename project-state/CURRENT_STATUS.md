# CURRENT_STATUS

## Stand: CAN-23.9 abgeschlossen

CAN-23.9 hat Alert-Request, Overlay-ACK, Sound-ACK und Finish-ACK read-only sichtbar gemacht.

## Neu

```text
GET /api/alerts/eventbus/ack-status
```

## Sicherheitsstatus

```text
readOnly: true
alertReplay: false
queueTouched: false
soundTouched: false
overlayRecovery: false
eventBusEmit: false
recoveryExecution: false
```

## Naechster Schritt

```text
Alert-System: Alert-Bus-Command-Vertrag read-only sichtbar machen.
```
