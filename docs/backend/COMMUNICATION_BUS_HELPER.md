# Communication Bus Helper

## Version

```text
Communication Core:      v0.3.0
helper_communication.js: v0.3.0 / STEP278F
communication_bus.js:    v0.3.0 / STEP278H
WS Test Client:          v0.1.0 / STEP278K
Master Test Overlay:     v0.1.1 / STEP278M
```

## Status

Der Communication Bus besitzt aktuell:

- Helper Core
- Status/Test/Ack/Issue/Reset API
- optionale Security-/Audit-Hooks
- WebSocket Client Registration via `hello`
- WebSocket Heartbeat
- WebSocket Ack / Bus Ack
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
- Debug-Status für Client, Verbindung, Reconnect, Event und ACK anzeigen
- Session-/Reconnect-Informationen bei Reloads sichtbar machen
- Heartbeat-Intervall bei Reconnect sauber stoppen und neu starten

Das Overlay ist weiterhin nicht produktiv angebunden.

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

## Bewusst nicht umgesetzt

- keine Alert-/Sound-/TTS-/VIP-Migration
- kein Ersatz von `broadcastWS`
- keine Dashboard-Seite
- keine Datenbankmigration
- keine OBS-Änderung
