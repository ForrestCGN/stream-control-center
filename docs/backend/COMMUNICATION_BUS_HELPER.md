# STEP278H — Communication Bus WebSocket Client Registration

Status: WS registration prepared  
Production migration: none  
Database migration: none

## Ziel

`backend/modules/communication_bus.js` kann jetzt WebSocket-Clients per `hello`, `heartbeat` und `ack` am Communication Bus registrieren.

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

Antwort:

```json
{
  "type": "hello_ack",
  "ok": true,
  "bus": "cgn",
  "clientId": "overlay_master_test"
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

## Server-Hook

`backend/server.js` wurde nur minimal erweitert:

- Module mit `handleWsMessage()` können WS-Messages optional behandeln.
- Bestehendes `broadcastWS()` bleibt unverändert.
- Unbekannte Messages werden nicht blockiert.

## Bewusst nicht geändert

- keine Alert-/Sound-/TTS-/VIP-Migration
- kein Ersatz von `broadcastWS`
- keine Dashboard-Seite
- keine Datenbankmigration
- keine OBS-Änderung
- keine bestehende Funktionalität entfernt
