# Overlay Monitor STEP 1 – Read-only Bus-Anmeldung

## Ziel

Dieser STEP ergänzt eine sichere Read-only-Grundlage für Overlay-Überwachung über den vorhandenen Communication Bus.

## Neue Dateien

- `backend/modules/overlay_monitor.js`
- `htdocs/overlays/shared/overlay_bus_client.js`
- `htdocs/overlays/_overlay-bus-test.html`

## Was geändert wird

- Ein neues Backend-Modul `overlay_monitor.js` wird automatisch von `backend/server.js` geladen.
- Das Modul nutzt den vorhandenen `communication_bus.js` und dessen `helper_communication.js`.
- Es baut keine eigene WebSocket-Registry.
- Es stellt read-only Statusrouten bereit:
  - `GET /api/overlay-monitor/status`
  - `GET /api/overlay-monitor/events`
  - `GET /api/overlay-monitor/routes`
- Das Test-Overlay meldet sich per `bus_hello` beim Communication Bus an.
- Das Test-Overlay sendet alle 5 Sekunden `bus_heartbeat`.

## Was ausdrücklich nicht gemacht wird

- Kein OBS-Refresh.
- Keine OBS-Szenenprüfung.
- Keine automatische Reparatur.
- Keine Änderung an bestehenden Overlays.
- Keine Änderung an Alerts, VIP, Sound, TTS oder Deathcounter.
- Keine Änderung an Datenbanken.

## Testablauf

1. ZIP in das Repo/Livesystem entpacken.
2. Node-Server neu starten.
3. Prüfen:
   - `http://127.0.0.1:8080/api/_status`
   - `http://127.0.0.1:8080/api/overlay-monitor/routes`
4. Test-Overlay im Browser öffnen:
   - `http://127.0.0.1:8080/overlays/_overlay-bus-test.html?debug=1`
5. Status prüfen:
   - `http://127.0.0.1:8080/api/communication/status`
   - `http://127.0.0.1:8080/api/overlay-monitor/status`

Erwartung:

- In `/api/communication/status` erscheint ein Client `overlay:bus_test`.
- In `/api/overlay-monitor/status` erscheint unter `overlays` ebenfalls `overlay:bus_test`.
- Status sollte nach wenigen Sekunden `online` sein.

## Nächster STEP

Wenn der Test stabil läuft, können wir danach das Dashboard gezielt um eine Overlay-Monitor-Anzeige erweitern oder einzelne echte Overlays nacheinander mit `overlay_bus_client.js` verbinden.
