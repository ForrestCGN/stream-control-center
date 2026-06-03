# CAN-42.18 - Birthday Status-Diagnostics

## Ziel

`/api/birthday/status` an den zentralen Diagnostics-Standard angleichen, damit Admin > Diagnose > Birthday die vorhandenen Statusdaten generisch anzeigen kann.

## Geändert

```text
backend/modules/birthday.js
```

## Technische Änderung

- `MODULE_VERSION` von `0.6.0` auf `0.6.1` erhöht.
- `MODULE_BUILD = "diagnostics-standard"` ergänzt.
- `MODULE_META.build` ergänzt.
- `buildRoutes()` ergänzt, damit Routenliste und `routeCount` nicht mehr nur inline im Status stehen.
- `buildStandardDiagnostics()` ergänzt.
- `buildStatus()` erweitert um:
  - `moduleVersion`
  - `moduleBuild`
  - `diagnosticVersion`
  - `routeCount`
  - `dataEndpoints`
  - `diagnostics`

## Diagnostics-Inhalte

Der neue `diagnostics`-Block liefert:

```text
counts
database
state
warnings
errors
lastError
```

## Bewusst nicht geändert

- Birthday-Command-Ausführung
- automatische Geburtstagsgrüße
- Tagebuch-/Chat-Ausgabe
- Birthday-Show-/Party-/Queue-Logik
- Upload-/Import-/Media-Logik
- Admin-User-/Settings-/Texteditor-Routen
- DB-Migrationen
- Dashboard-Dateien

Keine Funktionalität entfernt.

## Test

```powershell
node -c backend\modulesirthday.js

$b = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
$b | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,initialized,routeCount
$b.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$b.diagnostics.counts
```
