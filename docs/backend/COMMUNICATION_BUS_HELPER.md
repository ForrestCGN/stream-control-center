# Communication Bus Helper

## Version

```text
Communication Core:      v0.3.0
helper_communication.js: v0.3.0 / STEP278F
communication_bus.js:    v0.4.0 / STEP278N
WS Test Client:          v0.1.0 / STEP278K
Master Test Overlay:     v0.1.2 / STEP278N
```

## Status

Der Communication Bus besitzt aktuell:

- Helper Core
- Status/Test/Ack/Issue/Replay/Reset API
- optionale Security-/Audit-Hooks
- WebSocket Client Registration via `hello`
- WebSocket Heartbeat
- WebSocket Ack / Bus Ack
- kontrollierten Replay-Test per `/api/communication/replay`
- manuellen Browser-Testclient unter `/public/tools/communication_ws_test_client.html`
- Master-Test-Overlay als echten Communication-Bus-Testclient unter `/overlays/_overlay-master-test.html?debug=1`

## Testclient

URL:

```text
http://127.0.0.1:8080/public/tools/communication_ws_test_client.html
```

Der Testclient kann:

- WebSocket verbinden
- `hello` senden
- `heartbeat` senden
- Testevent per API erzeugen
- `ack` für das letzte Testevent senden
- Communication Status anzeigen

## Master-Test-Overlay

URL:

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1
```

Das Master-Test-Overlay kann im reinen Mirror-/Testmodus:

- sich als Bus-Client per `type: "hello"` registrieren
- regelmäßige `type: "heartbeat"` senden
- Bus-Testevents aus `/api/communication/test` empfangen
- empfangene Events mit `type: "ack"` bestätigen
- Test-/Mirror-Karten anzeigen
- Debug-Status für Client, Event und ACK anzeigen
- Reconnect-/Session-Debug anzeigen
- Replay-/Resync-Testevents anzeigen und bestätigen

Das Overlay ist weiterhin nicht produktiv angebunden.

## Replay-/Resync-Test

Replay wird in STEP278N bewusst nicht automatisch bei jedem `hello` ausgeführt.

Kontrollierter Testweg:

```text
http://127.0.0.1:8080/api/communication/replay?clientId=overlay_master_test&includeAckRequired=1
```

Die Route nutzt intern die vorhandene Helper-Funktion `replayForClient(clientId, { includeAckRequired })`.

Typischer Testablauf:

1. Bus resetten.
2. Overlay geschlossen lassen.
3. Replayable Testevent mit langer TTL erzeugen.
4. Overlay öffnen.
5. Replay-Route auslösen.
6. Status prüfen.

## Modul-Metadaten

`communication_bus.js` gibt in Status-Ausgaben aus:

```json
{
  "module": "communication_bus",
  "moduleVersion": "0.4.0",
  "moduleBuild": "STEP278N",
  "coreName": "communication_core",
  "coreVersion": "0.3.0"
}
```

## Bewusst nicht umgesetzt

- kein automatisches Replay bei `hello`
- keine Alert-/Sound-/TTS-/VIP-Migration
- kein Ersatz von `broadcastWS`
- keine Dashboard-Seite
- keine Datenbankmigration
- keine OBS-Änderung
