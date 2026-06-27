# Commands Status Diagnostics - CAN-42.11

## Ziel

`GET /api/commands/status` liefert zusätzlich zum bisherigen leichten Status einen standardisierten `diagnostics`-Block für die zentrale Admin-Diagnose.

## Datei

```text
backend/modules/commands.js
```

## Technische Änderung

- Modulversion: `0.1.6` -> `0.1.7`
- Build: `channel-guard` -> `channel-guard-diagnostics`
- Ergänzt:
  - `countTableRows()`
  - `safeDatabaseInfo()`
  - `buildStandardDiagnostics()`
- `statusPayload()` enthält neu:

```js
diagnostics: buildStandardDiagnostics()
```

## Diagnostics-Felder

```text
ok
health
module
version
build
schemaVersion
schemaReady
configSource
textSource
database
counts
warnings
errors
lastError
```

## Sicherheitsgrenze

```text
Keine Command-Ausführung geändert.
Keine Trigger geändert.
Keine Aliase geändert.
Keine Permissions geändert.
Keine Cooldowns geändert.
Keine Zielrouten geändert.
Keine DB-Migration.
Keine produktiven Flows geändert.
Keine Funktionalität entfernt.
```

## Tests

```powershell
node -c backend\modules\commands.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,version,enabled,schemaOk,schemaError
$s.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$s.diagnostics.counts
```
