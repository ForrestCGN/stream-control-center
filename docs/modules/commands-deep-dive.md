# Commands — Backend v0.1.5 safe-edit-param-fix

## Zweck

Behebt den Fehler `Unknown named parameter 'createdAt'` beim Bearbeiten bestehender Commands.

## Ursache

Beim sicheren Editieren wurde ein gemeinsames Parameter-Objekt für `UPDATE` und `INSERT` genutzt. Das Objekt enthielt `createdAt`, obwohl das `UPDATE`-SQL nur `updatedAt` verwendet. `node:sqlite` meldet ungenutzte benannte Parameter als Fehler.

## Fix

- `UPDATE` nutzt nun ein bereinigtes `updateParams` ohne `createdAt`.
- `INSERT` nutzt nun ein bereinigtes `insertParams` ohne `id`.
- Safe-Edit per `id/originalTrigger` bleibt erhalten.
- Trigger-Kollisionen werden weiterhin mit `command_trigger_already_exists` geblockt.
- Keine Datenbank-Migration, kein Schema-Touch, keine Funktionsentfernung.

## Test

```bat
node --check backend\modules\commands.js
```

Nach Deploy/Restart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status" |
  Select-Object ok,module,moduleVersion,moduleBuild
```

Erwartung:

```text
moduleVersion = 0.1.5
moduleBuild   = safe-edit-param-fix
```
