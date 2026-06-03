# NEXT_STEPS

## Direkt nächster Schritt

CAN-42.16 anwenden und testen:

```powershell
.\stepdone.cmd "CAN-42.16 Media status diagnostics-standard"

node -c backend\modules\media.js

$m = Invoke-RestMethod "http://127.0.0.1:8080/api/media/status"
$m | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,routeCount
$m.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$m.diagnostics.counts
```

Danach Dashboard hart neu laden (`STRG+F5`) und prüfen:

```text
Admin > Diagnose > Medienverwaltung
```

Erwartung: Medienverwaltung zeigt Status `OK` und im generischen Standard-Diagnoseblock Zähler, Datenbank- und Statuswerte.

## Danach

Nächstes Modul auf Diagnostics-Standard prüfen/angleichen, z. B. Alerts oder Birthday.

## Nicht ohne separaten Go-Schritt

- keine Upload-/Scan-/Delete-/Resolve-Logik ändern
- keine Asset-Pfade ändern
- keine DB-Migration
- keine neuen Dashboard-Module ohne Rückfrage
- keine Funktionalität entfernen
