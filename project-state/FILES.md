# FILES

Stand: EVS-2 / Stream Events Backend Foundation
Datum: 2026-06-13

## In diesem Code-/Doku-ZIP enthalten

```text
backend/modules/stream_events.js
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS_2_STREAM_EVENTS_BACKEND_FOUNDATION.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Neue Runtime-Datei

```text
backend/modules/stream_events.js
```

## Neue/aktualisierte Doku-Dateien

```text
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS_2_STREAM_EVENTS_BACKEND_FOUNDATION.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Neue API-Routen

```text
GET  /api/stream-events/status
GET  /api/stream-events/routes
GET  /api/stream-events/texts
GET  /api/stream-events/events
POST /api/stream-events/events
GET  /api/stream-events/events/:eventUid
PUT  /api/stream-events/events/:eventUid
POST /api/stream-events/events/:eventUid/validate
POST /api/stream-events/events/:eventUid/start
POST /api/stream-events/events/:eventUid/finish
POST /api/stream-events/events/:eventUid/cancel
GET  /api/stream-events/events/:eventUid/ranking
POST /api/stream-events/events/:eventUid/points
```

## Neue DB-Tabellen

Nicht ersetzen, nicht manuell löschen:

```text
stream_events_events
stream_events_score_entries
stream_events_rounds
```

## Durch EVS-2 NICHT geändert

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/*
backend/modules/sound_system.js
backend/modules/helpers/helper_media.js
backend/modules/twitch_presence.js
backend/modules/twitch_events.js
backend/modules/loyalty_giveaways.js
backend/modules/loyalty_games.js
backend/modules/commands.js
```
