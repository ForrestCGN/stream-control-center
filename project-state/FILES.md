# FILES

## STEP273A

Geänderte/gelieferte Dateien:

- `backend/modules/commands.js`
- `tools/easy/STEP273A_APPLY_TWITCH_PRESENCE_COMMAND_HOOK.cjs`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP273A_COMMAND_SYSTEM_CORE.md`

## Relevante bestehende Dateien

- `backend/modules/twitch_presence.js`
  - Zentrale Twitch-IRC-Verbindung.
  - Wird durch das STEP273A-Hook-Tool minimal erweitert.
- `backend/modules/deathcounter_v2.js`
  - Hat bereits `/api/deathcounter/v2/command`.
  - Wird in STEP273A nicht direkt geändert.
- `backend/core/database.js`
  - Wird für sanfte DB-Erweiterungen genutzt.

## Neue DB-Tabellen

- `command_definitions`
- `command_execution_log`

## Relevante Laufzeitpfade

- Repo: `D:\Git\stream-control-center`
- Live-System: `D:\Streaming\stramAssets`
- SQLite: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`
