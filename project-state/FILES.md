# FILES – EVS52.15 Report-/Diagnose-Cleanup

Stand: 2026-06-18

## Dateien in diesem Step

```text
backend/modules/stream_events.js
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS52_15_REPORT_DIAG_CLEANUP.md
project-state/CHANGELOG.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/FILES.md
```

## Relevante Test-Routen

```text
GET /api/stream-events/status
GET /api/stream-events/text-runtime/report
GET /api/stream-events/events?status=active&limit=20
```

## Wichtige Statusfelder

```text
moduleVersion
moduleBuild
runtime.counters.textWordHitChatOutputsBundled
runtime.counters.textPhraseSolves
runtime.counters.chatOutputsLiveSent
text-runtime/report.phraseSolves[].points
text-runtime/report.phraseSolves[].pointsAwarded
```
