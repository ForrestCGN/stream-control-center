# STEP621C - Overlay-Monitor: Hello und echten Heartbeat trennen

Stand: 2026-05-31

## Ziel

Overlay-Monitoring darf `bus_hello` nicht mehr als echten Heartbeat bewerten.

Ein Overlay kann jetzt getrennt bewertet werden:

- `bus_hello` = Client wurde geladen/angemeldet
- `bus_heartbeat` = Client sendet ein echtes wiederholtes Lebenszeichen
- `ws_close` = WebSocket wurde geschlossen, z. B. durch Ausblenden/Deaktivieren der OBS-Quelle

## Geänderte Dateien

- `backend/modules/helpers/helper_communication.js`
- `backend/modules/communication_bus.js`
- `backend/modules/overlay_monitor.js`
- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`

## Änderungen Backend

### helper_communication

- `lastHelloAt` wird bei Client-Registrierung gesetzt.
- `lastHeartbeatAt` wird bei Registrierung nicht mehr automatisch gesetzt.
- `lastHeartbeatAt` wird nur noch durch echte Heartbeat-Meldungen aktualisiert.
- `heartbeatCount` zählt echte Heartbeats.
- `publicClient()` liefert `lastHelloAt`, `hasHeartbeat` und `heartbeatCount` aus.

### communication_bus

- `bus_hello` übernimmt jetzt `data.meta` statt diese Daten zu verwerfen.
- `bus_heartbeat` übernimmt zusätzliche Daten wie `mode`, `hostId`, `name`, `lastError` und `meta`.

### overlay_monitor

- Statusbewertung nutzt echte Heartbeats.
- Clients ohne echten Heartbeat werden als `registered` gemeldet.
- Summary enthält `withHeartbeat`, `withoutHeartbeat` und `registered`.
- Issues zeigen nun explizit: nur angemeldet, aber ohne echten Heartbeat.

## Änderungen Dashboard

Im Overlay-Monitor wird nun getrennt angezeigt:

- letzter Hello
- letzter echter Heartbeat
- Heartbeat-Zähler
- Status `registered` / „Nur angemeldet“
- Quellenbewertung unterscheidet „sichtbar + Heartbeat“ von „sichtbar + nur angemeldet“

## Nicht geändert

- keine OBS-Aktionen
- kein Cache-Refresh
- kein Aus-/Einblenden per Button
- keine Automatik
- keine DB-Migration
- keine Overlay-HTML-Änderungen

## Erwartetes Verhalten

Wenn ein Overlay nur `bus_hello` sendet, aber keinen `bus_heartbeat`, steht es nicht mehr als normal `online`, sondern als `registered` bzw. „nur angemeldet“.

Wenn ein Overlay echte Heartbeats sendet, wird `lastHeartbeatAt` gesetzt und `heartbeatCount` hochgezählt.

Wenn OBS eine Quelle ausblendet und der WebSocket schließt, wird der Client weiter als offline erkannt.

## Test

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\helpers\helper_communication.js
node --check backend\modules\communication_bus.js
node --check backend\modules\overlay_monitor.js
node --check htdocs\dashboard\modules\overlays.js
.\stepdone.cmd "STEP621C Overlay-Monitor Hello und Heartbeat trennen"
```

Backend danach neu starten, da Backend-Dateien geändert wurden.
