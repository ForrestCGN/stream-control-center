# Next Steps

## Direkt nach CAN-43.13/CAN-43.14

1. CAN-43.13-43.14 ZIP nach `D:\Git\stream-control-center` entpacken.
2. Optional prüfen:

```powershell
node -c backend\modules\overlay_monitor.js
node -c backend\modules\bus_diagnostics.js
```

3. Step abschließen:

```powershell
.\stepdone.cmd "CAN-43.13-43.14 Overlay-Monitor and Bus-Diagnostics reviews"
```

4. Doku committen/pushen.

## Nächster fachlicher Schritt

CAN-43.15: `communication_bus` separat prüfen.

Grund:

- Erster Batch hat falsche URLs `/api/communication-bus/*` verwendet.
- `bus_diagnostics` zeigt als echte Route `/api/communication/status`.
- Der Communication Bus ist Kernbestandteil des Systems und sollte als eigener Step dokumentiert werden.

## Mini-Export für CAN-43.15

```powershell
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outDir = Join-Path (Get-Location) "diagnostics_exports\CAN-43_communication_$stamp"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function Save-Json($name, $url) {
  try {
    Invoke-RestMethod $url | ConvertTo-Json -Depth 80 | Out-File (Join-Path $outDir "$name.json") -Encoding utf8
  } catch {
    $_ | Out-String | Out-File (Join-Path $outDir "$name.ERROR.txt") -Encoding utf8
  }
}

Save-Json "00_registry" "http://127.0.0.1:8080/api/diagnostics/registry"
Save-Json "10_communication_status" "http://127.0.0.1:8080/api/communication/status"
Save-Json "11_communication_routes" "http://127.0.0.1:8080/api/communication/routes"
Save-Json "12_communication_clients" "http://127.0.0.1:8080/api/communication/clients"
Save-Json "13_communication_diagnostics" "http://127.0.0.1:8080/api/communication/diagnostics"

Compress-Archive -Path (Join-Path $outDir "*") -DestinationPath "$outDir.zip" -Force
Write-Host "ZIP: $outDir.zip"
```

Falls einige Routen 404 liefern, ist das ok; daraus wird der echte Routenstand dokumentiert.

## Pflicht bei jedem Modul

- echten Dateistand prüfen
- Statusroute prüfen
- `diagnostics`-Block prüfen
- Registry-Eintrag prüfen
- Coverage-Test prüfen
- keine neue Dashboard-Diagnose-Extra-Datei ohne explizite Begründung
- Modul-Doku aktualisieren
- project-state aktualisieren
- vor Umsetzung auf `go` warten
