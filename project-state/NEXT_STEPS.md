# NEXT_STEPS

## Direkt nächster Schritt

CAN-42.15 anwenden und testen:

```powershell
.\stepdone.cmd "CAN-42.15 Sound-System status diagnostics-standard"

node -c backend\modules\sound_system.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,enabled,paused,routeCount
$s.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$s.diagnostics.counts
```

Danach Dashboard hart neu laden (`STRG+F5`) und prüfen:

```text
Admin > Diagnose > Sound-System
```

Erwartung: Sound-System zeigt Status `OK` und im generischen Standard-Diagnoseblock Zähler, Datenbank- und Statuswerte.

## Danach

Nächstes Modul auf Diagnostics-Standard prüfen/angleichen.

## Nicht ohne separaten Go-Schritt

- keine produktiven Sound-Aktionen ändern
- keine Queue-/Timer-/Playback-Logik ändern
- keine DB-Migration
- keine neuen Dashboard-Module ohne Rückfrage
- keine Funktionalität entfernen
