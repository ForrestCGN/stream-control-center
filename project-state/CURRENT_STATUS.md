# CURRENT_STATUS

Stand: 2026-05-26

## Commands

Commands-Modul steht jetzt bei Version `0.1.2`, Build `status-no-schema-touch`.

`/api/commands/status` ist Status-only und ruft kein `ensureSchema()` mehr auf. Dadurch sollte die langsame Statusroute deutlich schneller reagieren.

## Unverändert

- Command-Liste: `/api/commands/list`
- Command-Catalog: `/api/commands/catalog`
- Logs: `/api/commands/logs`
- Command-Ausführung/Test/Upsert/Delete
- DB-Schema
- Dashboard-Logik
