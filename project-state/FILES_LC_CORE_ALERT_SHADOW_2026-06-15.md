# FILES – LC Core / Twitch Events / Alert Shadow

Stand: 2026-06-15

## In diesem Arbeitsbereich geänderte Hauptdateien

```text
backend/modules/twitch.js
backend/modules/loyalty.js
backend/modules/alert_system.js
```

## Relevante Diagnose-/Systemdateien

```text
backend/modules/twitch_events.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
```

## Neue/aktualisierte Doku-Dateien aus diesem Abschluss

```text
docs/current/CURRENT_CHAT_HANDOFF_LC_CORE_ALERT_SHADOW_2026-06-15.md
docs/current/NEXT_CHAT_PROMPT_LOYALTY_CORE_2026-06-15.md
docs/current/DOC_UPDATE_NOTES_LC_CORE_ALERT_SHADOW_2026-06-15.md
docs/modules/twitch_events_loyalty_and_alert_shadow.md
project-state/CURRENT_STATUS_LC_CORE_ALERT_SHADOW_2026-06-15.md
project-state/NEXT_STEPS_LC_CORE_ALERT_SHADOW_2026-06-15.md
project-state/TODO_LC_CORE_ALERT_SHADOW_2026-06-15.md
project-state/CHANGELOG_LC_CORE_ALERT_SHADOW_2026-06-15.md
project-state/FILES_LC_CORE_ALERT_SHADOW_2026-06-15.md
```

## Wichtige Routen

```text
GET /api/twitch/eventsub/status
GET /api/twitch/events/status
GET /api/loyalty/status
GET /api/loyalty/events?limit=...
GET /api/alerts/status
GET /api/alerts/twitch-events/status
```
