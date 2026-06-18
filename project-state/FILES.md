# FILES – relevante Dateien

Stand: 2026-06-18 – EVS50.2

## Event-System / Punkte-Check

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS50_2_POINTS_CHECK.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Relevante Routen

```text
GET  /api/stream-events/events/:eventUid/ranking
GET  /api/stream-events/statistics/users?eventUid=<eventUid>
GET  /api/stream-events/statistics/user/:login?eventUid=<eventUid>
GET  /api/stream-events/text-runtime/report?eventUid=<eventUid>
GET  /api/stream-events/sound-runtime/report?eventUid=<eventUid>
GET  /api/stream-events/runtime-parts/status?eventUid=<eventUid>
POST /api/stream-events/test/run?confirm=1&step=sound-correct
POST /api/stream-events/test/run?confirm=1&step=points-check
```

## Dashboard

```text
http://127.0.0.1:8080/dashboard
Event-System → Test
Event-System → Aktuelles Event
```

## Wichtige Datenbanktabellen

```text
stream_events_score_entries
stream_events_text_word_hits
stream_events_text_phrase_solves
stream_events_rounds
stream_events_events
```

## Hinweise

- Event-Punkte bleiben getrennt von Loyalty-Punkten.
- Ranking addiert alle Event-Punkte pro User/Event aus `stream_events_score_entries`.
- Quelle/Teilspiel wird über `source_type` getrennt angezeigt.
- `points-check` ist ein synthetischer Testflow und sendet nichts in Twitch.
