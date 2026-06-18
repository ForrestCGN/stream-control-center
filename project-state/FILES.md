# FILES – EVS52.9 relevante Dateien

Stand: 2026-06-18

## Doku-/Handoff-Dateien dieses Steps

```text
docs/current/EVS52_9_CHAT_DIAGNOSTIC_ANALYSIS.md
docs/current/CURRENT_CHAT_HANDOFF_EVS52_9_CHAT_UNIFICATION.md
docs/current/PROMPT_NEW_CHAT_EVS52_9_CHAT_UNIFICATION.txt
project-state/CHANGELOG.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/FILES.md
docs/modules/stream_events.md
```

## Code-Dateien, die im nächsten Chat zuerst geprüft werden müssen

```text
backend/modules/stream_events.js
backend/modules/twitch_events.js
backend/modules/twitch_presence.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
```

## Falls nötig zusätzlich prüfen/anfordern

```text
backend/modules/commands.js
backend/modules/sound*.js
backend/modules/twitch.js
backend/modules/twitch_presence.js
backend/modules/helpers/helper_chat_output.js
backend/modules/helpers/helper_texts.js
```

Nur wenn im echten Code klar wird, dass Soundantworten dort verarbeitet werden.

## Relevante Routen

```text
GET  /api/communication/status
GET  /api/twitch/events/status
GET  /api/twitch/events/eventsub/chat/status
GET  /api/stream-events/status
GET  /api/stream-events/text-runtime/live-debug
GET  /api/stream-events/text-runtime/report
GET  /api/chat-output/status
POST /api/stream-events/test/run?confirm=1&step=text-live-flow-check
```

## Relevante Testscripte

```text
tools/tests/EVS52_5_TEXT_LIVE_FLOW_CHECK.ps1
tools/tests/EVS52_6_LIVE_CHAT_DIRECT_BRIDGE_CHECK.ps1
tools/tests/EVS52_7_TWITCH_PRESENCE_CHAT_BRIDGE_CHECK.ps1
tools/tests/EVS52_8_TWITCH_CHAT_BUS_FALLBACK_CHECK.ps1
```

Hinweis: EVS52.6–EVS52.8 Tests sind Diagnose/Altlasten; im nächsten Chat prüfen, ob sie noch gebraucht werden oder nach sauberer Zentralarchitektur ersetzt werden.


## EVS52.9 geaenderte Dateien

```text
backend/modules/stream_events.js
backend/modules/twitch_presence.js
docs/modules/stream_events.md
docs/modules/twitch_presence.md
project-state/CHANGELOG.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_EVS52_9_TWITCH_EVENTS_CHAT_SOURCE.md
```

Nicht geaendert, aber relevant fuer Test/Status:

```text
backend/modules/twitch_events.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

## EVS52.10 geänderte Dateien

```text
backend/modules/stream_events.js
backend/modules/twitch_events.js
backend/modules/twitch_presence.js
project-state/CHANGELOG.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_EVS52_10_CHAT_ACTIVE_EVENT_HOTFIX.md
```


## EVS52.11 geaenderte Dateien

```text
backend/modules/stream_events.js
docs/modules/stream_events.md
project-state/CHANGELOG.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_EVS52_11_CHAT_COMMAND_AWAIT_FIX.md
```

EVS52.11 aendert nur `stream_events.js` im Code. `twitch_events.js` und `twitch_presence.js` bleiben aus EVS52.10 unveraendert.


## EVS52.12 geaenderte Dateien

```text
backend/modules/stream_events.js
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS52_12_BOT_SELF_MESSAGE_FILTER.md
project-state/CHANGELOG.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/FILES.md
```
