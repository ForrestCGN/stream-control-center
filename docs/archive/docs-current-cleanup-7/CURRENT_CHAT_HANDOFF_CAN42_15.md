# CURRENT_CHAT_HANDOFF_CAN42_15

## Stand

CAN-42.15 vorbereitet: Sound-System `/api/sound/status` wurde um standardisierte Diagnostics erweitert.

## Datei

```text
backend/modules/sound_system.js
```

## Kernänderung

- `MODULE_VERSION = "0.1.21"`
- `MODULE_BUILD = "diagnostics-standard"`
- `MODULE_META.build` ergänzt
- `safeCountTableRows()` ergänzt
- `buildStandardDiagnostics()` ergänzt
- `publicState()` liefert zusätzlich:
  - `moduleVersion`
  - `moduleBuild`
  - `diagnosticVersion`
  - `routes`
  - `routeCount`
  - `dataEndpoints`
  - `diagnostics`

## Nicht geändert

```text
Sound-Ausführung
Queue-/Parallel-/Bundle-Logik
Play-/Stop-/Skip-/Pause-/Resume-Routen
EventBus-Test-/Command-Routen
Overlay-/Device-/Discord-Playback
DB-Migration
Dashboard-Dateien
```

Keine Funktionalität entfernt.

## Nächster Schritt

Nach Entpacken:

```powershell
.\stepdone.cmd "CAN-42.15 Sound-System status diagnostics-standard"
node -c backend\modules\sound_system.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,enabled,paused,routeCount
$s.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$s.diagnostics.counts
```

Dann Dashboard hart neu laden und `Admin > Diagnose > Sound-System` prüfen.
