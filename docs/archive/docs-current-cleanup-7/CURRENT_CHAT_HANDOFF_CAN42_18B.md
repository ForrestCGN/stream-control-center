# Current Chat Handoff - CAN42.18b

## Stand

CAN-42.18b vorbereitet: Birthday-Diagnostics `schemaReady`-Bewertung korrigiert.

## Ausgangslage

Nach CAN-42.18 lieferte `/api/birthday/status` gültige Daten, `schemaOk=true`, `schemaVersion=7`, aber `diagnostics.schemaReady=false` und dadurch `health=warn`.

## Änderung

Geändert wurde ausschließlich:

```text
backend/modules/birthday.js
```

`state.schemaReady` wird jetzt im Birthday-Modul gepflegt:

- `true` bei erfolgreichem `ensureSchema()`
- `false` bei Schemafehler

## Nicht geändert

Keine Birthday-Command-, Show-, Queue-, Party-, Text-, Dashboard- oder DB-Migrationslogik wurde geändert. Keine Funktionalität entfernt.

## Nächster Test

```powershell
.\stepdone.cmd "CAN-42.18b Birthday schemaReady diagnostics fix"
node -c backend\modules\birthday.js

$b = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
$b.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
```
