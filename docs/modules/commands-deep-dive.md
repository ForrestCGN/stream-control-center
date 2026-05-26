# Commands-System Deep Dive

Stand: 2026-05-26  
Modul-Version: `0.1.2`  
Build: `status-no-schema-touch`

## Zweck

Zentrales Command-System für definierbare Chatcommands, Ausführung, Cooldowns, Permissions und Logs.

## Änderung

`GET /api/commands/status` ist jetzt ein echter, leichtgewichtiger Runtime-Status.

Vorher bremsten zwei Dinge:

1. Status lieferte zusätzlich Command-Liste, Catalog und letzte Logs.
2. Status rief weiterhin `ensureSchema()` auf.

Jetzt gilt:

- `/api/commands/status` ruft kein `ensureSchema()` mehr auf.
- Status enthält `moduleVersion`, `moduleBuild`, `lightStatus=true` und `schemaTouchOnStatus=false`.
- Command-Liste, Catalog und Logs bleiben über getrennte Endpunkte verfügbar.

| Daten | Route |
|---|---|
| Commands | `/api/commands/list` |
| Catalog | `/api/commands/catalog` |
| Logs | `/api/commands/logs?limit=10` |

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
- Schema-Schutz bleibt bei Init, List, Upsert, Delete, Logs, Test und Execute.
- Status ist Status-only und berührt die DB nicht mehr über `ensureSchema()`.

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status" | Select-Object ok,module,moduleVersion,moduleBuild,lightStatus,schemaTouchOnStatus
Measure-Command { Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status" | Out-Null }
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/list"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/catalog"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/logs?limit=10"
```
