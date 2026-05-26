# NEXT_STEPS

Stand: 2026-05-26 / nach STEP488

## Direkt prüfen

```bat
cd D:\Git\stream-control-center
node --check backend\modules\helpers\helper_communication.js
```

Falls STEP487 bereits entpackt wurde:

```bat
del backend\modules\helpers\helper_communication_contract.js
```

## Runtime-Test Communication Bus

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=hello"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/watchdog"
```

## Alte Funktionen bewusst prüfen

- `/api/communication/status` lädt ohne Fehler.
- `/api/communication/test` erzeugt weiterhin Events.
- `/api/communication/ack` funktioniert weiterhin mit bekannten Event-IDs.
- `/api/communication/replay` funktioniert weiterhin mit registrierten Clients.
- `/api/communication/watchdog` zeigt keine neuen unerwarteten Fehler.

## Nächster sinnvoller Fach-STEP

```text
STEP489_CHANNELPOINTS_BACKEND_SKELETON
```

Ziel:

```text
channelpoints.js Grundmodul
moduleVersion 0.1.0
/api/channelpoints/status
Bus-Registrierung über registerModule
Status/Heartbeat über publishModuleStatus/heartbeatModule
noch keine Twitch-Schreibaktionen
noch keine riskante DB-Migration
```
