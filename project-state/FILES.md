# FILES – EVS52.14 getesteter stabiler Stand

Stand: 2026-06-18

## Aktueller Code-Stand

```text
backend/modules/stream_events.js
```

Aktiver Stand:

```text
moduleVersion : 0.5.85
moduleBuild   : STEP_EVS52_14_NEUTRAL_UNIQUE_TEXT_HINTS
```

## Relevante Backend-Dateien für weitere Arbeiten

```text
backend/modules/stream_events.js
backend/modules/twitch_events.js
backend/modules/twitch_presence.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
backend/modules/helpers/helper_chat_output.js
backend/modules/helpers/helper_texts.js
```

## Relevante Dashboard-/Overlay-Dateien

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
htdocs/overlays/stream_events/event_runtime_overlay.html
htdocs/overlays/stream_events/event_winner_overlay.html
htdocs/overlays/stream_events/event_winner_overlay_layout.json
```

Hinweis: Overlay-Dateinamen vor Änderung im echten Repo prüfen. Nicht raten.

## Relevante Doku-/Projektstandsdateien

```text
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS52_14_TESTED_STABLE.md
docs/current/PROMPT_NEW_CHAT_EVS52_14_TESTED_STABLE.txt
docs/current/TEST_REPORT_EVS52_14_TESTED_STABLE.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/FILES.md
```

## Relevante Routen

```text
GET  /api/stream-events/status
GET  /api/stream-events/events?status=active&limit=20
GET  /api/stream-events/text-runtime/report
GET  /api/communication/status
GET  /api/twitch/events/status
GET  /api/chat-output/status
POST /api/stream-events/test/run?confirm=1&step=text-live-flow-check
POST /api/stream-events/events/:eventUid/cancel
```

## EVS52.9–EVS52.14 STEP-Dateien

```text
STEP_EVS52_9_TWITCH_EVENTS_CHAT_SOURCE.zip
STEP_EVS52_10_CHAT_ACTIVE_EVENT_HOTFIX.zip
STEP_EVS52_11_CHAT_COMMAND_AWAIT_FIX.zip
STEP_EVS52_12_BOT_SELF_MESSAGE_FILTER.zip
STEP_EVS52_13_TEXT_HINT_CHAT_BUNDLE.zip
STEP_EVS52_14_NEUTRAL_UNIQUE_TEXT_HINTS.zip
STEP_EVS52_14B_VERSION_MARKER_FIX.zip
```

## Gezielte bekannte offene Punkte

```text
stream_events.js              Diagnosezähler textWordHitChatOutputsBundled prüfen
stream_events.js/report       phraseSolves.points im Report prüfen
stream_events Dashboard       Bot-/Ignore-Liste später konfigurierbar machen
Satzlösungs-Overlay           Textlayout optisch verbessern
```
