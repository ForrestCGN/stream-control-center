# STEP278Q - Communication Debug View

## Ziel

STEP278Q ergänzt eine reine Browser-Diagnoseseite für den Communication Bus.

Die Seite dient dazu, Bus-Status, Clients, Events, Issues, Watchdog-Diagnosen und Recovery-Ergebnisse lesbar zu prüfen, ohne große JSON-Blöcke manuell auswerten zu müssen.

## Neue Datei

```text
htdocs/public/tools/communication_debug_view.html
```

URL:

```text
http://127.0.0.1:8080/public/tools/communication_debug_view.html
```

## Tool-Version

```text
communication_debug_view v0.1.0 / STEP278Q
```

## Funktionen

Die Debug View nutzt ausschließlich bestehende APIs:

- `/api/communication/status`
- `/api/communication/watchdog`
- `/api/communication/watchdog?track=1`
- `/api/communication/watchdog?includeRecovered=1`
- `/api/communication/watchdog?includeRecovered=1&trackRecovered=1`
- `/api/communication/replay?clientId=overlay_master_test&includeAckRequired=1`
- `/api/communication/reset?confirm=1`
- `/api/communication/reset?confirm=1&clients=1`

## Angezeigte Bereiche

- Bus-Übersicht mit Modulversion, Build, Stats und Zählern
- Clients mit Status, Version, Heartbeat, ACK und Capabilities
- Events mit Channel/Action, Replay-/ACK-Flags, Delivery, ACK-Count und Ablaufzeit
- Watchdog-Diagnose mit aktuellen Problemen
- Recovered Events aus `includeRecovered=1`
- historische Issues aus `issues[]`
- Aktionslog für ausgeführte Buttons/API-Aufrufe

## Buttons

- Status aktualisieren
- Watchdog prüfen
- Watchdog tracken
- Watchdog + Recovery prüfen
- Recovery tracken
- Replay `overlay_master_test`
- Reset Events/Issues
- Reset inkl. Clients
- Master-Test-Overlay öffnen

## Bewusst nicht geändert

- keine Änderung an `backend/modules/communication_bus.js`
- keine neue API
- kein automatischer Watchdog-Timer
- keine DB-Änderung
- keine Dashboard-/Login-/Rollen-Integration
- keine Alert-/Sound-/TTS-/VIP-Migration
- kein Ersatz von `broadcastWS`
- keine OBS-Änderung
- keine Änderung am Master-Test-Overlay

## Test

1. Backend nach Deploy starten.
2. Debug View öffnen:
   - `http://127.0.0.1:8080/public/tools/communication_debug_view.html`
3. Status aktualisieren.
4. Optional Master-Test-Overlay öffnen:
   - `http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1`
5. Testevent erzeugen:
   - `http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=Debug%20View%20Test&requireAck=1&replayable=1`
6. In der Debug View prüfen:
   - Client sichtbar
   - Event/ACK-Zähler nachvollziehbar
   - Watchdog-Diagnose lesbar
   - Recovery-Test nachvollziehbar
