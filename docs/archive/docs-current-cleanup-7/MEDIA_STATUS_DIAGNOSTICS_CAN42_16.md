# CAN-42.16 - Media Status-Diagnostics

## Ziel

Die bestehende Medienverwaltung wird an den zentralen Diagnostics-Standard angepasst.

Betroffene Statusroute:

```text
GET /api/media/status
```

## Geändert

```text
backend/modules/media.js
```

Ergänzt:

- `MODULE_VERSION` auf `0.1.1` erhöht.
- `MODULE_BUILD = "diagnostics-standard"` ergänzt.
- `MODULE_META.build` auf `diagnostics-standard` gesetzt.
- `MODULE_META.step` hält den bisherigen STEP-Hinweis weiter fest.
- Read-only Helper ergänzt:
  - `buildRoutes()`
  - `buildDataEndpoints()`
  - `safeCountTableRows()`
  - `safeDatabaseInfo()`
  - `buildStandardDiagnostics()`
- `/api/media/status` liefert zusätzlich:
  - `moduleVersion`
  - `moduleBuild`
  - `diagnosticVersion`
  - `routeCount`
  - `dataEndpoints`
  - `diagnostics`
- `module.exports.getStatus` verweist auf `statusPayload`.

## Diagnostics-Inhalt

Der neue `diagnostics`-Block enthält:

- `counts`
  - aktive Medien
  - letzte Medien
  - Kategorien
  - Audio/Video/Bild/Animation
  - Tabellenzeilen
  - Routen
  - Media-Typen
  - Default-Kategorien
- `database`
  - Adapter
  - DB-Pfad
  - Schema-Version
  - erwartete Schema-Version
- `state`
  - Initialisierung
  - Ladezeit
  - letzter Scan
  - letzter Upload
  - letzte Änderung
  - Assets-/Media-Pfad
- `warnings`, `errors`, `lastError`

## Nicht geändert

```text
Keine Upload-Logik
Keine Scan-Logik
Keine Delete-/Update-/Resolve-Logik
Keine Picker-/Kategorie-Logik
Keine bestehenden Asset-Pfade
Keine DB-Migration
Keine Dashboard-Dateien
Keine neue Moduldatei
Keine Funktionalität entfernt
```

## Test

```powershell
.\stepdone.cmd "CAN-42.16 Media status diagnostics-standard"

node -c backend\modules\media.js

$m = Invoke-RestMethod "http://127.0.0.1:8080/api/media/status"
$m | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,routeCount
$m.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$m.diagnostics.counts
```

Dashboard hart neu laden (`STRG+F5`) und prüfen:

```text
Admin > Diagnose > Medienverwaltung
```
