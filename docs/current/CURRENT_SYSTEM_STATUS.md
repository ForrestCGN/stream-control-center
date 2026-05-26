# Current System Status

Stand: 2026-05-26  
Aktueller STEP: `STEP497_COMMANDS_STATUS_LIGHT`

## Commands

`/api/commands/status` wurde optimiert und liefert nun nur noch schnellen Status. Schwere Daten werden weiterhin über getrennte Endpunkte geladen:

- `/api/commands/list`
- `/api/commands/catalog`
- `/api/commands/logs`

Grund: Messung zeigte ca. 7,55 Sekunden für `/api/commands/status`, während die Einzelendpunkte nur ca. 11-17 ms benötigten.

## Kanalpunkte

Kanalpunkte-Dashboard und lokales CRUD bleiben unverändert aus STEP493-STEP495.
