# FILES - stream-control-center

Stand: 2026-05-10

## STEP220

Geaendert:

```text
backend/modules/twitch.js
project-state/STEP220_TWITCH_ALERT_SUB_MESSAGE_BUFFER_2026-05-10.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

Nicht geaendert:

```text
backend/modules/alert_system.js
backend/modules/loyalty.js
backend/core/database.js
backend/modules/sqlite_core.js
package.json
app.sqlite
htdocs/**
config/**
```

## STEP217

Geaendert:

```text
project-state/STEP217_DB_CORE_PORTABILITY_RESCAN_2026-05-10.md
project-state/STEP216_CHALLENGE_DB_CORE_PORTABILITY_2026-05-10.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

Nicht geaendert:

```text
backend/core/database.js
backend/modules/sqlite_core.js
backend/modules/*.js
package.json
app.sqlite
```

## DB-Portabilitaet bisher portiert

```text
backend/modules/kofi.js
backend/modules/tipeee.js
backend/modules/twitch.js
backend/modules/sound_system.js
backend/modules/dashboard_auth.js
backend/modules/alert_system.js
backend/modules/tagebuch.js
backend/modules/todo.js
backend/modules/challenge.js
```

## Zentrale DB-Schicht

```text
backend/core/database.js
backend/modules/sqlite_core.js
```

## Bekannter Sonderfall aus Restscan

```text
backend/check_alert_db.js
```

Einordnung: altes technisches Pruefscript, kein normales produktives Modul. Keine Aenderung in STEP217 oder STEP220.
