# Overlay Monitor – Read-only Bus-Anmeldung und Dashboard-Sicht

Stand: 2026-05-30
Version: 0.1.0

## Ziel

Das Overlay-Monitoring nutzt den vorhandenen Communication Bus als zentrale CAN-Bus-artige Kommunikationsschicht. Overlays melden sich als Bus-Clients an und senden Heartbeats. Der Overlay Monitor und die Bus-Diagnose werten diesen Zustand read-only aus.

## Vorhandene Dateien

```text
backend/modules/overlay_monitor.js
htdocs/overlays/shared/overlay_bus_client.js
htdocs/overlays/_overlay-bus-test.html
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
```

## Backend-Grundlage

`overlay_monitor.js` ist ein read-only Fachmodul über dem vorhandenen `communication_bus.js`.

Es baut keine eigene WebSocket-Registry und ändert keine OBS-Quellen.

Routen:

```text
GET /api/overlay-monitor/status
GET /api/overlay-monitor/events
GET /api/overlay-monitor/routes
```

## Test-Overlay

Das Test-Overlay:

```text
/overlays/_overlay-bus-test.html?debug=1
```

meldet sich als Client `overlay:bus_test` beim Communication Bus an und sendet Heartbeats.

## Dashboard-Sicht

Die bestehende Bus-Diagnose zeigt Overlay-Clients jetzt in einer eigenen Sektion `Overlay-Clients` an.

Die Anzeige filtert:

```text
client.type === "overlay"
oder
client.id beginnt mit "overlay:"
```

Angezeigt werden:

```text
Overlay-Name
Client-ID
Modul
Status
Verbindungsstatus
letzter Heartbeat
Capabilities
```

## Bewusst nicht enthalten

```text
kein OBS-Refresh
keine OBS-Szenenprüfung
keine automatische Reparatur
keine Änderung produktiver Overlay-Flows
keine Änderung an Alerts/VIP/Sound/TTS/Deathcounter
keine DB-Änderung
```

## Kurzer Test

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/overlay-monitor/status"
$r.overlays | Select-Object id,module,name,connected,status,lastHeartbeatAt
```

Erwartung bei geöffnetem Test-Overlay:

```text
overlay:bus_test
connected=True
status=online
```

Erwartung nach geschlossenem Test-Overlay und kurzer Wartezeit:

```text
overlay:bus_test
connected=False
status=offline
```

## Nächster sinnvoller Schritt

Echte Overlays nur einzeln und kontrolliert anbinden. Vor jedem echten Overlay prüfen:

```text
bestehende Overlay-Datei
bestehender WebSocket-/API-Flow
bestehende OBS-Browserquelle
Risiko für produktive Anzeige
Rollback-Möglichkeit
```
