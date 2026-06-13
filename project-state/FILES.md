# FILES – stream_events / Event-System

Stand: 2026-06-13 nach EVS-21

## Aktive Projektdateien

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS_20_CHAT_OUTPUT_DISPATCHER_PREP.md
docs/current/CURRENT_CHAT_HANDOFF_EVS_21_EVENT_ARCHIVE_DELETE_LIFECYCLE_PREP.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Wichtige vorhandene Systeme, die weiterverwendet werden

```text
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_media.js
backend/modules/sound_system.js
backend/modules/twitch_events.js
backend/modules/twitch_presence.js
backend/core/database.js
htdocs/dashboard/components/media_picker.js
htdocs/dashboard/components/media_field.js
```

## Neue EVS-20-Routen

```text
GET  /api/stream-events/chat-output/status
GET  /api/stream-events/chat-output/report
POST /api/stream-events/chat-output/test-dispatch
```

## Bisherige Artefakte / Steps

- EVS-1 Planung
- EVS-2 Backend Foundation
- EVS-3 Dashboard Skeleton
- EVS-4 Media Picker Prep
- EVS-4b Sound Media Layout Cleanup
- EVS-5 Text Game Config Layout Cleanup
- EVS-5b Text Game Rule Rebalance
- EVS-5c Text Backend TODO Documentation
- EVS-5d Text Multi Phrase Word Points Documentation
- EVS-6 Text Multi Phrase Config Prep
- EVS-7 Text Config Dashboard Prep
- EVS-7b Dashboard Tabs Layout Split
- EVS-7c Event Overview Editor Flow Cleanup
- EVS-8 Config Dashboard Prep
- EVS-8b EventBus Heartbeat TODO Documentation
- EVS-9 EventBus Heartbeat Integration
- EVS-10 Text Chat Runtime Prep
- EVS-10b Text Runtime Test Helpers
- EVS-11 Text Chat Output Prep
- EVS-11b Text Chat Output Test Visibility
- EVS-11c SafeJson Chat Output Fix
- EVS-12 Text Runtime Dashboard Report
- EVS-13 User Statistics Filter
- EVS-13b User Stats Modal AutoRefresh
- EVS-14 Sound Runtime Prep
- EVS-15 Sound Runtime Test Helpers
- EVS-16 Sound Runtime Dashboard Report
- EVS-16b Statistics Tab Layout Cleanup
- EVS-16c Texts Tab Module Filter Cleanup
- EVS-17 Sound Chat Answer Prep
- EVS-17b Sound Debug Accepted Answers
- EVS-18 Sound Twitch Chat Answer Runtime
- EVS-18c Event Lifecycle Archive Rules
- EVS-19 Sound/Text Parallel AND Runtime
- EVS-19a/b/c/d/e Fixes bis bestätigt
- EVS-20 ChatOutput Dispatcher Prep

- EVS-21 Event Archive/Delete Lifecycle Prep
