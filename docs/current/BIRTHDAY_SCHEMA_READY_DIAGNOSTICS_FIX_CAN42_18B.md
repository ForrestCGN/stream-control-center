# CAN-42.18b - Birthday schemaReady Diagnostics Fix

## Ziel

Birthday-Diagnostics nach CAN-42.18 korrigieren: `schemaReady` wurde in der Diagnose als `false` angezeigt, obwohl `schemaOk=true`, `schemaVersion=7` und keine Fehler vorhanden waren.

## Änderung

Datei:

```text
backend/modules/birthday.js
```

Minimal angepasst:

- `state.schemaReady` im Runtime-State ergänzt.
- `ensureSchema()` setzt `state.schemaReady = true` bei erfolgreichem Schema-Check.
- `ensureSchema()` setzt `state.schemaReady = false` bei Schemafehler.

## Nicht geändert

```text
Keine Birthday-Commands
Keine automatische Geburtstagslogik
Keine Show-/Queue-/Party-Logik
Keine Texte
Keine Dashboard-Dateien
Keine DB-Migration
Keine neue Moduldatei
Keine Funktionalität entfernt
```

## Test

```powershell
node -c backend\modules\birthday.js

$b = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
$b.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
```

Erwartung:

```text
health      : ok
schemaReady : True
lastError   : leer
```
