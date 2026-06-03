# NEXT_STEPS

## Direkt nächster Schritt

CAN-42.18 anwenden und testen:

```powershell
.\stepdone.cmd "CAN-42.18 Birthday status diagnostics-standard"

node -c backend\modulesirthday.js

$b = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
$b | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,initialized,routeCount
$b.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$b.diagnostics.counts
```

Danach Dashboard hart neu laden (`STRG+F5`) und prüfen:

```text
Admin > Diagnose > Birthday
```

Erwartung: Birthday zeigt Status `OK` oder ggf. `Warnung`, wenn optionale Diagnosepunkte auffällig sind. Die produktive Birthday-Logik bleibt unverändert.

## Danach

Nächstes Modul auf Diagnostics-Standard prüfen/angleichen, z. B. Overlay-Monitor oder Bus-Diagnose-Folgeprüfung.

## Nicht ohne separaten Go-Schritt

- keine Birthday-Command-Ausführung ändern
- keine automatischen Geburtstagsgrüße ändern
- keine Tagebuch-/Chat-Ausgabe ändern
- keine Birthday-Show-/Party-/Queue-Logik ändern
- keine Upload-/Import-/Media-Logik ändern
- keine Admin-User-/Settings-/Texteditor-Routen ändern
- keine DB-Migration
- keine neuen Dashboard-Module ohne Rückfrage
- keine Funktionalität entfernen
