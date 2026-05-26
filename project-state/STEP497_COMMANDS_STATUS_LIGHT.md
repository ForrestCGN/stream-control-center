# STEP497_COMMANDS_STATUS_LIGHT

## Ziel

`/api/commands/status` beschleunigen, weil die Route vor dem Step ca. 7,55 Sekunden benötigte.

## Änderung

Die Route liefert nicht mehr:

- `commands`
- `moduleCatalog`
- `recent`

Stattdessen verweist sie auf:

- `/api/commands/list`
- `/api/commands/catalog`
- `/api/commands/logs?limit=10`

## Erwartung

`/api/commands/status` sollte nach dem Deploy deutlich schneller reagieren.

## Test

```powershell
Measure-Command { Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status" | Out-Null }
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/list"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/catalog"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/logs?limit=10"
```
