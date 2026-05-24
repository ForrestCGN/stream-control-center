# STEP278B — Communication Bus Helper

Status: Core helper prepared  
Live migration: none  
Production modules changed: none

## Ziel

`backend/modules/helpers/helper_communication.js` stellt den ersten zentralen Communication-Bus-Core bereit.

Der Helper ist bewusst noch nicht in Alert-, Sound-, TTS-, VIP- oder Dashboard-Module eingebunden.

## Enthaltene Funktionen

- `createCommunicationBus(options)`
- `registerClient(ws, clientInfo)`
- `unregisterClient(clientId, reason)`
- `heartbeat(clientId, payload)`
- `updateClientStatuses(context)`
- `emit(message)`
- `ack(eventId, clientId, status, details)`
- `replayForClient(clientId, options)`
- `trackIssue(key, message, options)`
- `getStatus()`
- `reset(options)`

## Client Registry

Clients können sein:

```text
overlay
overlay_host
overlay_child
dashboard
module
streamerbot
system
```

## Message-Struktur

```json
{
  "bus": "cgn",
  "version": 1,
  "id": "evt_...",
  "type": "command",
  "channel": "visual.alert",
  "action": "play",
  "source": { "type": "module", "id": "alert_system" },
  "target": { "type": "overlay", "id": "alerts_v2" },
  "payload": {},
  "meta": {
    "requireAck": true,
    "replayable": true,
    "ttlMs": 15000
  }
}
```

## Bewusst nicht enthalten

- keine Änderung an `backend/server.js`
- keine Migration von `alert_system.js`
- keine Migration von `sound_system.js`
- keine Dashboard-Seite
- keine SQLite-Migration
- kein automatisches Live-Monitoring
- kein Ersatz von `broadcastWS`

## Nächster Schritt

STEP278C kann darauf aufbauen:

```text
helper_security_context.js
helper_audit.js
SoundSystem Bus Adapter
Alert Overlay Migration
```
