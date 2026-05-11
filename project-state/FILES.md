# FILES - stream-control-center

Stand: 2026-05-11

## STEP227

Geaendert:

```text
backend/modules/twitch.js
project-state/STEP227_TWITCH_EVENTSUB_SUBSCRIPTIONS_STATUS_2026-05-11.md
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
htdocs/**
config/**
app.sqlite
```



## STEP226

Geaendert:

```text
backend/modules/twitch.js
backend/modules/alert_system.js
project-state/STEP226_TWITCH_CHEERMOTE_TTS_CLEANUP_2026-05-11.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

Nicht geaendert:

```text
htdocs/**
config/**
backend/modules/loyalty.js
backend/core/database.js
backend/modules/sqlite_core.js
app.sqlite
```

## STEP225

Geaendert:

```text
backend/modules/twitch.js
project-state/STEP225_TWITCH_EVENTSUB_INBOUND_AUDIT_2026-05-11.md
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
htdocs/**
config/**
app.sqlite
```

Neue Runtime-Datei nach echten Twitch-Events:

```text
data/logs/twitch_eventsub_audit.jsonl
```

## STEP224

Geaendert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/twitch_events.js
htdocs/dashboard/modules/twitch_events.css
project-state/STEP224_TWITCH_EVENT_SIMULATOR_DASHBOARD_2026-05-11.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

Nicht geaendert:

```text
backend/modules/twitch.js
backend/modules/alert_system.js
backend/modules/loyalty.js
backend/core/database.js
config/**
app.sqlite
```

## STEP223

Geaendert:

```text
backend/modules/alert_system.js
project-state/STEP223_ALERT_TTS_CHEER_WORD_CLEANUP_2026-05-11.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

Nicht geaendert:

```text
backend/modules/twitch.js
backend/modules/loyalty.js
backend/core/database.js
backend/modules/sqlite_core.js
htdocs/**
config/**
app.sqlite
```

## STEP222

Geaendert:

```text
backend/modules/twitch.js
project-state/STEP222_TWITCH_SUBSCRIPTION_TIER_MESSAGE_NORMALIZATION_2026-05-11.md
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
htdocs/**
config/**
package.json
app.sqlite
```

## STEP221

Geaendert:

```text
backend/modules/twitch.js
project-state/STEP221_TWITCH_EVENTSUB_DEBUG_SIMULATOR_BACKEND_2026-05-11.md
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
htdocs/**
config/**
package.json
app.sqlite
```

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


# FILES Ergänzung – STEP228

Neue/zu ergänzende Projektdatei:

```text
project-state/STEP228_TWITCH_EVENTSUB_ALERT_MAPPING_AUDIT_2026-05-11.md
```

Optionale Doku-Ableitungen aus diesem ZIP:

```text
project-state/CURRENT_STATUS_APPEND_STEP228.md
project-state/CHANGELOG_APPEND_STEP228.md
project-state/NEXT_STEPS_APPEND_STEP228.md
project-state/FILES_APPEND_STEP228.md
```

Empfohlene Integration im Repo:

```powershell
cd D:\Git\stream-control-center

# Datei aus ZIP nach project-state kopieren:
# project-state\STEP228_TWITCH_EVENTSUB_ALERT_MAPPING_AUDIT_2026-05-11.md

# Inhalte aus *_APPEND_STEP228.md manuell in die bestehenden Dateien übertragen:
# project-state\CURRENT_STATUS.md
# project-state\CHANGELOG.md
# project-state\NEXT_STEPS.md
# project-state\FILES.md
```


## STEP231

Geaendert:

```text
project-state/STEP231_MESSAGE_ROTATOR_LIVETEST_ABSCHLUSS_2026-05-11.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

Nicht geaendert:

```text
backend/modules/message_rotator.js
backend/core/database.js
backend/modules/helpers/**
backend/modules/sqlite_core.js
htdocs/**
config/**
app.sqlite
```

Einordnung:

```text
STEP231 ist ein Doku-/Abschluss-STEP nach erfolgreichem Livetest.
Keine Funktionalitaet wurde geaendert.
```
