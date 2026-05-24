# Master Overlay Alert Mirror Mode

## Zweck

Live-Alerts können zusätzlich an das Master-Testsystem gespiegelt werden.

Damit kann das Master-Overlay mit echten Alert-Daten getestet werden, ohne das produktive Legacy-Overlay zu ersetzen.

## Modus

```text
Legacy = produktiv
Master = Mirror/Preview
```

## Routing

```text
Alert Event
  -> Legacy Alert Overlay normal
  -> Master Overlay Mirror optional
```

## Sicherheitsregeln

- Master Mirror ist optional.
- Master Mirror darf Produktivstatus nicht verändern.
- Master Ack darf produktiven Alert nicht beenden.
- Master Fehler darf nicht als Live-Fehler gewertet werden.
- Master darf erst produktiv werden, wenn explizit umgeschaltet wurde.

## Config Beispiel

```json
{
  "overlayMaster": {
    "enabled": false,
    "testOnly": true,
    "mirror": {
      "alerts": {
        "enabled": true,
        "allowLiveEvents": true,
        "markAsPreview": true,
        "target": "overlay_master_test"
      }
    }
  }
}
```

## Payload Beispiel

```json
{
  "bus": "cgn",
  "type": "command",
  "channel": "visual.alert",
  "action": "play",
  "target": {
    "type": "overlay_host",
    "id": "overlay_master_test"
  },
  "payload": {
    "mirror": true,
    "preview": true,
    "productionTarget": false,
    "sourceEventId": "evt_live_123"
  }
}
```

## Acks

```text
ack from alerts_v2:
  production ack

ack from overlay_master_test:
  mirror ack only
```

## Test

Browser:

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1&mirror=1
```

OBS-Testszene:

```text
_TEST_MasterOverlay
```
