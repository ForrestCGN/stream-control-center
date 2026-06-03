# NEXT_STEPS

## Direkt nächster Schritt

CAN-42.19 entpacken und testen:

```powershell
.\stepdone.cmd "CAN-42.19 Overlay-Monitor status diagnostics-standard"

node -c backend\modules\overlay_monitor.js

$o = Invoke-RestMethod "http://127.0.0.1:8080/api/overlay-monitor/status"
$o | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,readOnly,routeCount
$o.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$o.diagnostics.counts
```

Danach Dashboard mit `STRG+F5` hart neu laden und prüfen:

```text
Admin > Diagnose > Overlay-Monitor
```

## Danach

Bei grünem Test ist CAN-42.19 abgeschlossen. Nächster Kandidat danach: weiteres Modul aus der zentralen Diagnose-Liste prüfen oder CAN-42 Diagnose-Runde zusammenfassen/dokumentieren.
