# FILES – relevante Dateien

Stand: 2026-06-18 – EVS51.3

## Event-System / Satz-Testbereich

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS51_3_TEXT_TEST_UI_CLEANUP.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Relevante Routen

```text
POST /api/stream-events/test/run?confirm=1&step=text-check
POST /api/stream-events/test/run?confirm=1&step=text-create
POST /api/stream-events/test/run?confirm=1&step=text-wrong
POST /api/stream-events/test/run?confirm=1&step=text-word
POST /api/stream-events/test/run?confirm=1&step=text-correct
POST /api/stream-events/test/run?confirm=1&step=text-duplicate
POST /api/stream-events/test/run?confirm=1&step=text-report
GET  /api/stream-events/text-runtime/report?eventUid=<eventUid>
GET  /api/stream-events/runtime-parts/status?eventUid=<eventUid>
GET  /api/stream-events/events/:eventUid/ranking
GET  /api/stream-events/statistics/user/:login?eventUid=<eventUid>
```

## Dashboard

```text
http://127.0.0.1:8080/dashboard
Event-System → Test → Satz-System gezielt testen
```

## Wichtige Datenbanktabellen

```text
stream_events_events
stream_events_score_entries
stream_events_text_word_hits
stream_events_text_phrase_solves
stream_events_sound_rounds
```
