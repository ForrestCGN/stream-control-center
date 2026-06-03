# NEXT_STEPS

## Direkt nächster Schritt

CAN-42.13 anwenden und testen:

```powershell
.\stepdone.cmd "CAN-42.13 Message-Rotator status diagnostics-standard"

node -c backend\modules\message_rotator.js

$m = Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/status"
$m | Select-Object ok,module,moduleVersion,moduleBuild,version,active,routeCount
$m.diagnostics | Select-Object ok,health,module,version,build,schemaReady,lastError
$m.diagnostics.counts
```

Danach Dashboard hart neu laden und prüfen:

```text
Admin > Diagnose > Message-Rotator
```

## Danach

Nächstes Modul auf Diagnostics-Standard prüfen/angleichen, z. B. VIP-System, Alerts, Sound-System oder Media.

## Nicht ohne separaten Go-Schritt

```text
Keine produktiven Routen ändern
Keine Start-/Stop-/Tick-/Next-/Manual-Logik ändern
Keine DB-Migration
Keine Funktionalität entfernen
```
