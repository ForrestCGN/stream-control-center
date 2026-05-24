# Communication Bus Helper

## Version

```text
Communication Core:      v0.3.0
helper_communication.js: v0.3.0
communication_bus.js:    v0.6.0
WS Test Client:          v0.1.0
Master Test Overlay:     v0.1.2
Debug View:              v0.1.1
```

## Anzeige-Standard

Sichtbare Modul-/Tool-Ausgaben zeigen ab jetzt nur noch Versionsnummern. STEP-Angaben bleiben Projekt- und Dokumentationshistorie und werden nicht mehr in Statuskarten, Debug-Views oder Modul-Anzeigen sichtbar ausgegeben.

Siehe:

```text
docs/backend/MODULE_VERSIONING_DISPLAY_STANDARD.md
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
- Communication Debug View unter `/public/tools/communication_debug_view.html`
- Master-Test-Overlay als echten Communication-Bus-Testclient unter `/overlays/_overlay-master-test.html?debug=1`

## Debug View

URL:

```text
http://127.0.0.1:8080/public/tools/communication_debug_view.html
```

Die Debug View zeigt:

- Bus-Übersicht
- Clients
- Events
- Watchdog-Diagnose
- Recovered Events
- historische Issues
- Aktionslog

Die Debug View zeigt sichtbar keine STEP-/Build-Angaben mehr. API-Rohfelder mit Build-/Step-Bezug werden in der Oberfläche ausgeblendet.

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

Replay wird bewusst nicht automatisch bei jedem `hello` ausgeführt.

Kontrollierter Testweg:

```text
http://127.0.0.1:8080/api/communication/replay?clientId=overlay_master_test&includeAckRequired=1
```

## Watchdog-/Issue-Test

Manuelle Watchdog-Diagnose:

```text
http://127.0.0.1:8080/api/communication/watchdog
```

Mit `track=1` werden erkannte Diagnosepunkte über `trackIssue()` in `issues[]` gespeichert:

```text
http://127.0.0.1:8080/api/communication/watchdog?track=1
```

Recovery-Test nach Replay + ACK:

```text
http://127.0.0.1:8080/api/communication/watchdog?includeRecovered=1
```

Optional kann Recovery explizit historisch getrackt werden:

```text
http://127.0.0.1:8080/api/communication/watchdog?includeRecovered=1&trackRecovered=1
```

Wichtig: Es gibt weiterhin keinen automatischen Watchdog-Timer. Die Diagnose ist bewusst manuell und testbasiert.

## Bewusst nicht umgesetzt

- kein automatischer Watchdog-Timer
- kein automatisches Löschen historischer Issues
- kein automatisches Replay bei `hello`
- keine Alert-/Sound-/TTS-/VIP-Migration
- kein Ersatz von `broadcastWS`
- keine Dashboard-Seite mit Auth/Rollen
- keine Datenbankmigration
- keine OBS-Änderung
