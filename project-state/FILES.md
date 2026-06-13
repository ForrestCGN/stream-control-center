# FILES – stream_events / Event-System

Stand: 2026-06-13 nach EVS-22c

## Aktive Projektdateien

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS_22C_COMPLETION_DOCUMENTATION.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Wichtige Routen

```text
GET  /api/stream-events/events
GET  /api/stream-events/chat-output/status
GET  /api/stream-events/chat-output/report
POST /api/stream-events/chat-output/test-dispatch
POST /api/stream-events/events/:eventUid/archive
POST /api/stream-events/events/:eventUid/delete
```

## Hinweise

- `GET /api/stream-events/events` liefert Eventlisten unter `rows`.
- Delete-Confirm für die API erfolgt per JSON-Body `{ "confirm": "DELETE" }`.
- Im Dashboard sieht der User nur eine normale Bestätigung.
