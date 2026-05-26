# Current System Status

Stand: 2026-05-26

## Commands

Aktuelle Modul-Version: `0.1.2`  
Build: `status-no-schema-touch`

`/api/commands/status` ist jetzt ein leichtgewichtiger Runtime-Status ohne schwere Datenfelder und ohne Schema-Touch.

Wichtig:

- `lightStatus=true`
- `schemaTouchOnStatus=false`
- `commands`, `moduleCatalog` und `recent` sind nicht mehr Teil von `/status`
- getrennte Endpunkte bleiben aktiv: `/list`, `/catalog`, `/logs`

Grund: Messung zeigte vorher ca. 7,55 Sekunden für `/api/commands/status`, während die Einzelendpunkte schnell waren.

## Kanalpunkte

Kanalpunkte-Dashboard und lokales CRUD bleiben unverändert. Commands und Kanalpunkte sollen langfristig als verwandte Interaction-Systeme mit ähnlicher Bedienstruktur aufgebaut werden.
