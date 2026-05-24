# Communication Bus Helper

## Version

```text
Communication Core:      v0.3.0
helper_communication.js: v0.3.0 / STEP278F
communication_bus.js:    v0.6.0 / STEP278P
WS Test Client:          v0.1.0 / STEP278K
Master Test Overlay:     v0.1.2 / STEP278N
Debug View:              v0.1.0 / STEP278Q
```

## Status

Der Communication Bus besitzt aktuell:

- Helper Core
- Status/Test/Ack/Issue/Replay/Watchdog/Reset API
- optionale Security-/Audit-Hooks
- WebSocket Client Registration via `hello`
- WebSocket Heartbeat
- WebSocket Ack / Bus Ack
- kontrollierten Replay-Test per `/api/communication/replay`
- manuellen Watchdog-/Issue-Test per `/api/communication/watchdog`
- Watchdog-Recovery-Auswertung per `includeRecovered=1`
- manuellen Browser-Testclient unter `/public/tools/communication_ws_test_client.html`
- Debug View unter `/public/tools/communication_debug_view.html`
- Master-Test-Overlay als echten Communication-Bus-Testclient unter `/overlays/_overlay-master-test.html?debug=1`

## Communication Debug View

URL:

```text
http://127.0.0.1:8080/public/tools/communication_debug_view.html
```

Die Debug View ist eine reine Test-/Diagnoseoberfläche und nutzt nur bestehende APIs.

Angezeigt werden:

- Bus-Übersicht mit Version, Build und Stats
- Clients mit Status, Modul, Version, Heartbeat, ACK und Capabilities
- Events mit Channel/Action, Replay-/ACK-Flags, Delivery, ACK-Count und Ablaufzeit
- Watchdog-Diagnose mit aktuellen Problemen
- Recovered Events aus `includeRecovered=1`
- historische Issues aus `issues[]`
- Aktionslog

Buttons:

- Status aktualisieren
- Watchdog prüfen
- Watchdog tracken
- Watchdog + Recovery prüfen
- Recovery tracken
- Replay `overlay_master_test`
- Reset Events/Issues
- Reset inkl. Clients
- Master-Test-Overlay öffnen

## Testclient

URL:

```text
http://127.0.0.1:8080/public/tools/communication_ws_test_client.html
```

## Master-Test-Overlay

URL:

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1
```

Das Overlay ist weiterhin nicht produktiv angebunden.

## Replay-/Resync-Test

Kontrollierter Testweg:

```text
http://127.0.0.1:8080/api/communication/replay?clientId=overlay_master_test&includeAckRequired=1
```

Replay wird bewusst nicht automatisch bei jedem `hello` ausgeführt.

## Watchdog-/Issue-Test

Manuelle Diagnose:

```text
http://127.0.0.1:8080/api/communication/watchdog
```

Tracking:

```text
http://127.0.0.1:8080/api/communication/watchdog?track=1
```

Recovery-Auswertung:

```text
http://127.0.0.1:8080/api/communication/watchdog?includeRecovered=1
```

Recovery historisch tracken:

```text
http://127.0.0.1:8080/api/communication/watchdog?includeRecovered=1&trackRecovered=1
```

## Bewusst nicht umgesetzt

- keine neue API für STEP278Q
- kein automatischer Watchdog-Timer
- kein automatisches Löschen historischer Issues
- kein automatisches Replay bei `hello`
- keine Alert-/Sound-/TTS-/VIP-Migration
- kein Ersatz von `broadcastWS`
- keine Dashboard-/Auth-/Rollenintegration
- keine Datenbankmigration
- keine OBS-Änderung
