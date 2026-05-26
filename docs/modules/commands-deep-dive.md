# Commands-System Deep Dive

Stand: 2026-05-26  
STEP: `STEP497_COMMANDS_STATUS_LIGHT`

## Zweck

Zentrales Command-System für definierbare Chatcommands, Ausführung, Cooldowns, Permissions und Logs.

## Änderung in STEP497

`GET /api/commands/status` wurde bewusst leichtgewichtig gemacht. Vorher enthielt die Statusroute zusätzlich:

- komplette Command-Liste
- kompletten Command-Catalog
- letzte Logs

Diese Daten werden weiterhin über eigene Endpunkte geladen:

| Daten | Route |
|---|---|
| Commands | `/api/commands/list` |
| Catalog | `/api/commands/catalog` |
| Logs | `/api/commands/logs?limit=10` |

Damit wird doppelte Arbeit im Dashboard vermieden, weil das Dashboard diese Endpunkte sowieso separat lädt.

## Datei

```text
backend/modules/commands.js
```

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/commands/status` |
| `GET` | `/api/commands/list` |
| `GET` | `/api/commands/catalog` |
| `POST` | `/api/commands/upsert` |
| `POST` | `/api/commands/delete` |
| `GET/POST` | `/api/commands/test` |
| `GET/POST` | `/api/commands/execute` |
| `GET` | `/api/commands/logs` |
| `GET` | `/api/commands/history` |

## Datenbanktabellen

- `command_definitions`
- `command_execution_log`

## Sicherheit / Regeln

- Keine Command-Funktionalität entfernt.
- Keine DB-Migration geändert.
- Keine Dashboard-Logik geändert.
- `/status` ist jetzt Status-only; Listen/Kataloge/Logs bleiben über eigene Routen abrufbar.

## Tests

```powershell
Measure-Command { Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status" | Out-Null }
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/list"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/catalog"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/logs?limit=10"
```
