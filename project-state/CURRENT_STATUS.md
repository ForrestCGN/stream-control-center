# CURRENT_STATUS

Stand: 2026-05-26  
STEP: `STEP497_COMMANDS_STATUS_LIGHT`

## Ergebnis

Commands-Statusroute wurde leichtgewichtig gemacht. Die Dashboard-Ladezeit sollte dadurch deutlich sinken, weil `/api/commands/status` keine Command-Liste, keinen Catalog und keine Logs mehr mitliefert.

## Unverändert

- Command-Liste: `/api/commands/list`
- Command-Catalog: `/api/commands/catalog`
- Logs: `/api/commands/logs`
- Command-Ausführung/Test/Upsert/Delete
- DB-Schema
