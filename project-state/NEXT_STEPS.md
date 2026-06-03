# NEXT_STEPS

## Direkt nächster Schritt

CAN-42.17 anwenden und testen:

```powershell
.\stepdone.cmd "CAN-42.17 Alerts status diagnostics-standard"

node -c backend\modules\alert_system.js

$a = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status"
$a | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,enabled,overlayEnabled,queueEnabled,routeCount
$a.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$a.diagnostics.counts
```

Danach Dashboard hart neu laden (`STRG+F5`) und prüfen:

```text
Admin > Diagnose > Alerts
```

Erwartung: Alerts zeigt Status `OK` oder ggf. `Warnung`, wenn optionale Diagnosepunkte wie `ffprobe`, `multer` oder Sound-Dauer-Metadaten auffällig sind. Die produktive Alert-Logik bleibt unverändert.

## Danach

Nächstes Modul auf Diagnostics-Standard prüfen/angleichen, z. B. Birthday oder Overlay-Monitor.

## Nicht ohne separaten Go-Schritt

- keine Alert-Ausführung ändern
- keine Queue-/Clear-/Reload-/Enqueue-/Test-Logik ändern
- keine Twitch-/Provider-Routen ändern
- keine Rules-/Assets-/Upload-/Duration-Scan-Logik ändern
- keine EventBus-/Overlay-Watchdog-/Bus-Mirror-Produktivlogik ändern
- keine DB-Migration
- keine neuen Dashboard-Module ohne Rückfrage
- keine Funktionalität entfernen
