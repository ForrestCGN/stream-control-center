# FILES

Stand: 2026-06-04

## Shoutout-System Kern

```text
backend/modules/clip_shoutout.js
config/clip_system.json
```

## Dashboard

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/shoutout.js
htdocs/dashboard/modules/shoutout.css
htdocs/dashboard/modules/auto_shoutout.js
htdocs/dashboard/modules/auto_shoutout.css
htdocs/dashboard/modules/shoutout_texts.js
htdocs/dashboard/modules/shoutout_texts.css
```

## Shoutout-Dokumentation

```text
docs/modules/clip-shoutout-vso.md
docs/modules/CLIP_SHOUTOUT_AUTOSHOUTOUT.md
docs/modules/SHOUTOUT_SYSTEM_STRUCTURE_PLAN.md
docs/modules/SHOUTOUT_SYSTEM_STANDARDS_ALIGNMENT.md
docs/modules/SHOUTOUT_TEXT_INVENTORY_AND_MIGRATION.md
docs/modules/SHOUTOUT_TEXT_BACKEND_ROUTES.md
docs/modules/SHOUTOUT_TEXT_BACKEND_FOUNDATION.md
docs/modules/SHOUTOUT_TEXT_DASHBOARD_TAB.md
```

## Aktuelle CAN-Dokumente

```text
docs/current/CAN44_14_SHOUTOUT_DASHBOARD_STRUCTURE_PLAN.md
docs/current/CAN44_15_SHOUTOUT_SYSTEM_STANDARDS_ALIGNMENT.md
docs/current/CAN44_16_SHOUTOUT_TEXT_INVENTORY_MIGRATION_PLAN.md
docs/current/CAN44_17_SHOUTOUT_TEXT_BACKEND_ROUTES_PLAN.md
docs/current/CAN44_18_SHOUTOUT_TEXT_BACKEND_FOUNDATION.md
docs/current/CAN44_19_SHOUTOUT_TEXT_DASHBOARD_TAB.md
docs/current/CAN44_19_1_SHOUTOUT_TEXT_UI_CLEANUP.md
docs/current/CAN44_19_2_SHOUTOUT_TEXT_DROPDOWN_LAYOUT.md
docs/current/CAN44_19_3_SHOUTOUT_TEXT_DROPDOWN_POLISH.md
docs/current/CAN44_19_4_SHOUTOUT_TEXT_DASHBOARD_FINAL_DOCS.md
```

## Aktuelle wichtige API-Routen

```text
GET  /api/clip-shoutout/status
GET  /api/clip-shoutout/queue
GET  /api/clip-shoutout/timeline
GET  /api/clip-shoutout/stats
GET  /api/clip-shoutout/inbound
GET  /api/clip-shoutout/inbound/stats
GET  /api/clip-shoutout/production-check
GET  /api/clip-shoutout/live-test
POST /api/clip-shoutout/run
GET  /api/clip-shoutout/auto
GET  /api/clip-shoutout/auto/settings
POST /api/clip-shoutout/auto/settings
GET  /api/clip-shoutout/auto/streamers
POST /api/clip-shoutout/auto/streamers
POST /api/clip-shoutout/auto/test-chat
GET  /api/clip-shoutout/texts
POST /api/clip-shoutout/texts
GET  /api/clip-shoutout/texts/migration
```

## DB-Tabellen relevant für Shoutout-System

```text
clip_shoutout_display_queue
clip_shoutout_official_queue
clip_shoutout_official_history
clip_shoutout_inbound_events
clip_shoutout_auto_settings
clip_shoutout_auto_streamers
clip_shoutout_auto_events
clip_shoutout_auto_message_activity
module_text_variants
module_texts
command_definitions
```
