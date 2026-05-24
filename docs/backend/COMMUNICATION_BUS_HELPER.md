# Communication Bus Helper

## Version

```text
Communication Core:      v0.3.0
helper_communication.js: v0.3.0 / STEP278F
communication_bus.js:    v0.3.0 / STEP278H
```

## Status

Der Communication Bus besitzt aktuell:

- Helper Core
- Status/Test/Ack/Issue/Reset API
- optionale Security-/Audit-Hooks
- WebSocket Client Registration via `hello`
- WebSocket Heartbeat
- WebSocket Ack / Bus Ack

## Modul-Metadaten

`communication_bus.js` gibt in Status-Ausgaben aus:

```json
{
  "module": "communication_bus",
  "moduleVersion": "0.3.0",
  "moduleBuild": "STEP278H",
  "coreName": "communication_core",
  "coreVersion": "0.3.0"
}
```

`helper_communication.js` exportiert `MODULE_META`.

## WebSocket Messages

### hello

```json
{
  "type": "hello",
  "clientId": "overlay_master_test",
  "clientType": "overlay",
  "module": "master_overlay",
  "mode": "standalone",
  "capabilities": ["test.ping"]
}
```

### heartbeat

```json
{
  "type": "heartbeat",
  "clientId": "overlay_master_test"
}
```

### ack

```json
{
  "type": "ack",
  "eventId": "evt_...",
  "clientId": "overlay_master_test",
  "status": "received"
}
```

## Bewusst nicht umgesetzt

- keine Alert-/Sound-/TTS-/VIP-Migration
- kein Ersatz von `broadcastWS`
- keine Dashboard-Seite
- keine Datenbankmigration
- keine OBS-Änderung
