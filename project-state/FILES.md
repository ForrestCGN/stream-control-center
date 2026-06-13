# FILES – stream_events / Event-System

Stand: 2026-06-13 nach EVS-17b

## Aktive Projektdateien

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS_17B_SOUND_DEBUG_ACCEPTED_ANSWERS.md
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

## Wichtige Routen

Basis:

```text
GET  /api/stream-events/status
GET  /api/stream-events/routes
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

Config/Texte:

```text
GET  /api/stream-events/config
POST /api/stream-events/config
GET  /api/stream-events/texts
```

Bus:

```text
GET /api/stream-events/bus-status
```

Text Runtime:

```text
GET  /api/stream-events/text-runtime/status
GET  /api/stream-events/text-runtime/report
POST /api/stream-events/text-runtime/test-chat
POST /api/stream-events/text-runtime/create-test-event?confirm=1
```

User Statistik:

```text
GET /api/stream-events/statistics/users
GET /api/stream-events/statistics/users?eventUid=<eventUid>
GET /api/stream-events/statistics/user/:login
GET /api/stream-events/statistics/user/:login?eventUid=<eventUid>
```

Sound Runtime:

```text
GET  /api/stream-events/sound-runtime/status
GET  /api/stream-events/sound-runtime/report
POST /api/stream-events/sound-runtime/create-test-event?confirm=1
POST /api/stream-events/sound-runtime/next-round
POST /api/stream-events/sound-runtime/resolve
POST /api/stream-events/sound-runtime/unresolved
POST /api/stream-events/sound-runtime/test-chat
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
