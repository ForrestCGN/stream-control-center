# CAN-42.12 - Hug Status Diagnostics Standard

## Ziel

Das bestehende Hug-Modul wird an den zentralen Diagnose-Standard angepasst.

Der bestehende Status-Endpunkt bleibt erhalten:

```text
GET /api/hug/status
```

Der Status liefert zusätzlich einen standardisierten Block:

```text
diagnostics.ok
diagnostics.health
diagnostics.module
diagnostics.version
diagnostics.build
diagnostics.schemaVersion
diagnostics.schemaReady
diagnostics.database
diagnostics.counts
diagnostics.warnings
diagnostics.errors
diagnostics.lastError
```

## Änderung

Datei:

```text
backend/modules/hug.js
```

Ergänzt wurden:

```text
MODULE_BUILD = "diagnostics-standard"
safeDatabaseInfo()
buildStandardDiagnostics(cfg, counts)
diagnostics: buildStandardDiagnostics(cfg, counts) im getDashboardStatus()-Payload
```

Außerdem wurde die Version erhöht:

```text
MODULE_VERSION: 0.1.0 -> 0.1.1
```

## Bewusst nicht geändert

```text
Hug/Rehug-Ausführung
Stats/Toplisten
Texteditoren
Reload-Routen
Chat-Ausgabe
Output-Modus
Datenbanktabellen
Migrationen
Dashboard-Dateien
```

## Test

Nach dem Entpacken zuerst den Step abschließen, danach testen:

```powershell
.\stepdone.cmd "CAN-42.12 Hug status diagnostics-standard"
node -c backend\modules\hug.js

$h = Invoke-RestMethod "http://127.0.0.1:8080/api/hug/status"
$h | Select-Object ok,module,moduleVersion,moduleBuild,version,enabled,schemaVersion,lastError
$h.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$h.diagnostics.counts
```

Erwartung:

```text
moduleVersion: 0.1.1
moduleBuild: diagnostics-standard
diagnostics.ok: True
diagnostics.schemaReady: True
```
