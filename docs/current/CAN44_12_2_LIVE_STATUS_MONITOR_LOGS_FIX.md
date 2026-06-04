# CAN-44.12.2 Live-Status Monitor Logs Fix

## Ziel
Behebt den Fehler im Logs-Endpunkt:

`Converting circular structure to JSON ... Timeout`

## Ursache
`GET /api/live-status-monitor/logs` gab den internen Runtime-State direkt aus. Darin liegt `sampleTimer`, ein Node.js `Timeout`-Objekt mit zirkulären Referenzen.

## Änderung
- `live_status_monitor.js` Version 0.1.2 / Build CAN-44.12.2
- neuer serialisierbarer Public-State via `getPublicState()`
- Logs-Route gibt nur noch saubere State-Felder aus
- keine DB-Strukturänderung
- keine Änderung an Logging, Status-Abfragen oder Dashboard-Logik

## Dateien
- `backend/modules/live_status_monitor.js`

## Test
```powershell
cd D:\Git\stream-control-center
node -c backend\modules\live_status_monitor.js
.\stepdone.cmd "CAN-44.12.2 Live-Status Monitor Logs Fix"
```

Nach Deploy/Node-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/live-status-monitor/logs?limit=20" |
  ConvertTo-Json -Depth 8
```
