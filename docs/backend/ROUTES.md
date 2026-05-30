# Backend Routes Inventory

Stand: 2026-05-30

## Zweck

Diese Datei ist eine zentrale, scanbasierte Routen-Inventur fuer das Projekt stream-control-center.

Sie wurde aus den lokalen Ergebnissen der STEPs 591 bis 594 erzeugt.

## Wichtiger Hinweis

Diese Inventur ist kein Ersatz fuer fachliche Pruefung.

Quelle: Regex-/Mention-Scan aus backend/**/*.js
Routen koennen False-Positives enthalten.
Dynamisch zusammengesetzte Routen koennen fehlen.
Vor produktiven Aenderungen immer echte Moduldatei pruefen.
Keine Routen aus dieser Datei ungeprueft als produktiv garantieren.

## Summary

Route hits input: 1596
Unique routes: 572
Areas: 11
Routes missing doc mention: 26
Generated: 2026-05-30 11:02:36

## Bereichsuebersicht

| Bereich | Unique routes | Missing doc mention |
|---|---:|---:|
| alerts | 87 | 1 |
| obs_overlay | 84 | 12 |
| other | 80 | 2 |
| stream_features | 73 | 1 |
| sound_media | 62 | 3 |
| dashboard_admin_security | 53 | 0 |
| discord_tagebuch_todo | 50 | 2 |
| twitch_chat | 45 | 5 |
| diagnostics | 18 | 0 |
| communication_bus | 16 | 0 |
| channelpoints | 4 | 0 |

## Priorisierte Doku-Batches aus STEP593

| Batch | Bereich | Score | Action | Primary Doc |
|---|---|---:|---|---|
| F | obs_overlay | 193 | routes_inventory_then_module_docs | docs/current/CURRENT_SYSTEM_STATUS.md |
| G | twitch_chat | 126 | routes_inventory_then_module_docs | docs/current/CURRENT_SYSTEM_STATUS.md |
| B | sound_media | 111 | routes_inventory_then_module_docs | docs/modules/sound_system_channelpoints_routing.md |
| Z | other | 107 | routes_inventory_then_module_docs | docs/backend/ROUTES.md |
| H | discord_tagebuch_todo | 91 | routes_inventory_then_module_docs | docs/modules/README.md |
| I | stream_features | 81 | routes_inventory_then_module_docs | docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md |
| C | alerts | 70 | routes_inventory_then_module_docs | docs/current/CURRENT_SYSTEM_STATUS.md |
| E | dashboard_admin_security | 53 | module_doc_mapping_review | docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md |
| D | communication_bus | 49 | module_doc_mapping_review | docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md |
| J | diagnostics | 6 | module_doc_mapping_review | docs/current/CURRENT_SYSTEM_STATUS.md |
| A | channelpoints | 2 | module_doc_mapping_review | docs/modules/channelpoints.md |

## Routen nach Bereichen

### alerts

| Route | Methoden | Dateien | Hits | Doku fehlt? |
|---|---|---|---:|---|
| /alerts | USE | backend/server.js | 1 | nein |
| /api/alerts | UNKNOWN | backend/modules/alert_system.js | 1 | nein |
| /api/alerts/assets | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/assets/:id | DELETE, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/assets/:id/usage | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/assets/scan-durations | POST, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/assets/upload | POST, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/bus-mirror/disable | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/bus-mirror/enable | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/bus-mirror/enable?confirm=1 | UNKNOWN | backend/modules/alert_system.js | 1 | ja |
| /api/alerts/bus-mirror/status | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/chat-blocks | GET, POST, UNKNOWN | backend/modules/alert_system.js | 6 | nein |
| /api/alerts/chat-blocks/:id | DELETE, PUT, UNKNOWN | backend/modules/alert_system.js | 6 | nein |
| /api/alerts/chat-outbox | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/chat-outbox/:id/consumed | POST, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/chat-outbox/:id/error | POST, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/chat-outbox/:id/sent | POST, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/clear | POST, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/config | GET, POST, UNKNOWN | backend/modules/alert_system.js | 7 | nein |
| /api/alerts/display-profiles | GET, POST, UNKNOWN | backend/modules/alert_system.js | 6 | nein |
| /api/alerts/display-profiles/:id | DELETE, PUT, UNKNOWN | backend/modules/alert_system.js | 6 | nein |
| /api/alerts/display-profiles/:id/play | POST, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/enqueue | POST, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/eventbus/correlation/check | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/eventbus/correlation/status | GET, UNKNOWN | backend/modules/alert_system.js, backend/modules/bus_diagnostics.js | 4 | nein |
| /api/alerts/eventbus/reset | GET, UNKNOWN | backend/modules/alert_system.js | 4 | nein |
| /api/alerts/eventbus/status | GET, UNKNOWN | backend/modules/alert_system.js, backend/modules/bus_diagnostics.js | 5 | nein |
| /api/alerts/eventbus/test | GET, UNKNOWN | backend/modules/alert_system.js | 4 | nein |
| /api/alerts/events | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/events/:eventUid/replay | POST, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/health | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/integration-check | GET, UNKNOWN | backend/modules/alert_system.js | 4 | nein |
| /api/alerts/kofi/config | UNKNOWN | backend/modules/kofi.js | 1 | nein |
| /api/alerts/kofi/reload | UNKNOWN | backend/modules/kofi.js | 1 | nein |
| /api/alerts/kofi/status | UNKNOWN | backend/modules/kofi.js | 1 | nein |
| /api/alerts/kofi/test | UNKNOWN | backend/modules/kofi.js | 1 | nein |
| /api/alerts/kofi/webhook | UNKNOWN | backend/modules/kofi.js | 1 | nein |
| /api/alerts/overlay-watchdog/check | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/overlay-watchdog/recover | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/overlay-watchdog/recover?confirm=1 | UNKNOWN | backend/modules/alert_system.js | 1 | nein |
| /api/alerts/overlay-watchdog/reset | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/overlay-watchdog/reset?confirm=1 | UNKNOWN | backend/modules/alert_system.js | 1 | nein |
| /api/alerts/overlay-watchdog/status | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/queue | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/reload | POST, UNKNOWN | backend/modules/alert_system.js | 4 | nein |
| /api/alerts/routes | GET, UNKNOWN | backend/modules/alert_system.js | 4 | nein |
| /api/alerts/rules | GET, POST, UNKNOWN | backend/modules/alert_system.js | 6 | nein |
| /api/alerts/rules/:id | DELETE, PUT, UNKNOWN | backend/modules/alert_system.js | 6 | nein |
| /api/alerts/rules/validate | POST, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/settings | GET, POST, UNKNOWN | backend/modules/alert_system.js | 7 | nein |
| /api/alerts/status | GET, UNKNOWN | backend/modules/alert_system.js | 4 | nein |
| /api/alerts/test | POST, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/test-presets | GET, POST, UNKNOWN | backend/modules/alert_system.js | 6 | nein |
| /api/alerts/test-presets/:id | DELETE, PUT, UNKNOWN | backend/modules/alert_system.js | 6 | nein |
| /api/alerts/test-presets/:id/play | POST, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/text-variants | GET, POST, UNKNOWN | backend/modules/alert_system.js | 6 | nein |
| /api/alerts/text-variants/:id | DELETE, PUT, UNKNOWN | backend/modules/alert_system.js | 6 | nein |
| /api/alerts/tipeee/config | UNKNOWN | backend/modules/tipeee.js | 1 | nein |
| /api/alerts/tipeee/connect | UNKNOWN | backend/modules/tipeee.js | 1 | nein |
| /api/alerts/tipeee/disconnect | UNKNOWN | backend/modules/tipeee.js | 1 | nein |
| /api/alerts/tipeee/events/recent | UNKNOWN | backend/modules/tipeee.js | 1 | nein |
| /api/alerts/tipeee/reconnect | UNKNOWN | backend/modules/tipeee.js | 1 | nein |
| /api/alerts/tipeee/reload | UNKNOWN | backend/modules/tipeee.js | 1 | nein |
| /api/alerts/tipeee/status | UNKNOWN | backend/modules/tipeee.js | 1 | nein |
| /api/alerts/tipeee/test | UNKNOWN | backend/modules/tipeee.js | 1 | nein |
| /api/alerts/tipeee/webhook | UNKNOWN | backend/modules/tipeee.js | 1 | nein |
| /api/alerts/twitch | POST, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/twitch/bits | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/twitch/follow | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/alerts/twitch/raid | GET, UNKNOWN | backend/modules/alert_system.js | 3 | nein |
| /api/communication/mirror-alert | GET | backend/modules/communication_bus.js | 2 | nein |
| /api/communication/test-alert | GET | backend/modules/communication_bus.js | 2 | nein |
| /api/twitch/alerts/audit/recent | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/alerts/debug/eventsub | UNKNOWN | backend/modules/twitch.js | 2 | nein |
| /api/twitch/alerts/debug/presets | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/alerts/reload | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/alerts/settings | UNKNOWN | backend/modules/twitch.js | 2 | nein |
| /api/twitch/alerts/status | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/alerts/test | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/eventsub/cache | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/eventsub/cache/all | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/eventsub/cleanup-disconnected | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/eventsub/reconcile | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/eventsub/reconnect | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/eventsub/status | UNKNOWN | backend/modules/twitch.js | 2 | nein |
| /api/twitch/eventsub/subscriptions | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/subscriptions | UNKNOWN | backend/modules/twitch.js | 1 | nein |

### channelpoints

| Route | Methoden | Dateien | Hits | Doku fehlt? |
|---|---|---|---:|---|
| /api/channelpoints | UNKNOWN | backend/modules/channelpoints.js, backend/modules/channelpoints_twitch_readonly_sync.js | 2 | nein |
| /api/channelpoints/eventbus/redemption-bridge | UNKNOWN | backend/modules/channelpoints_eventsub_bus_bridge.js | 1 | nein |
| /api/sound/play | POST, UNKNOWN | backend/modules/alert_system.js, backend/modules/birthday.js, backend/modules/channelpoints.js, backend/modules/commands.js, backend/modules/sound_media_bridge.js | 10 | nein |
| /api/twitch/auth/validate | GET, UNKNOWN | backend/modules/channelpoints.js, backend/modules/channelpoints_twitch_readonly_sync.js, backend/modules/twitch.js | 8 | nein |

### communication_bus

| Route | Methoden | Dateien | Hits | Doku fehlt? |
|---|---|---|---:|---|
| /api/bus-diagnostics/check | GET, UNKNOWN | backend/modules/bus_diagnostics.js | 3 | nein |
| /api/bus-diagnostics/routes | GET, UNKNOWN | backend/modules/bus_diagnostics.js | 3 | nein |
| /api/bus-diagnostics/status | GET, UNKNOWN | backend/modules/bus_diagnostics.js | 3 | nein |
| /api/communication/ack | GET | backend/modules/communication_bus.js | 2 | nein |
| /api/communication/client/forget | GET | backend/modules/communication_bus.js | 2 | nein |
| /api/communication/issue | GET | backend/modules/communication_bus.js | 2 | nein |
| /api/communication/replay | GET | backend/modules/communication_bus.js | 2 | nein |
| /api/communication/reset | GET | backend/modules/communication_bus.js | 2 | nein |
| /api/communication/status | GET, UNKNOWN | backend/modules/bus_diagnostics.js, backend/modules/communication_bus.js | 3 | nein |
| /api/communication/test | GET | backend/modules/communication_bus.js | 2 | nein |
| /api/communication/watchdog | GET | backend/modules/communication_bus.js | 2 | nein |
| /api/loyalty/events | GET | backend/modules/loyalty.js | 2 | nein |
| /api/loyalty/events/ingest | POST | backend/modules/loyalty.js | 2 | nein |
| /api/loyalty/events/test/:type | GET | backend/modules/loyalty.js | 2 | nein |
| /api/loyalty/runner/events | GET | backend/modules/loyalty.js | 2 | nein |
| /api/obs/audio/busy | GET | backend/modules/obs.js | 2 | nein |

### dashboard_admin_security

| Route | Methoden | Dateien | Hits | Doku fehlt? |
|---|---|---|---:|---|
| /api/auth/audit | GET | backend/modules/dashboard_auth.js | 2 | nein |
| /api/auth/bootstrap-owner-local | POST | backend/modules/dashboard_auth.js | 2 | nein |
| /api/auth/logout | POST | backend/modules/dashboard_auth.js | 2 | nein |
| /api/auth/roles | GET | backend/modules/dashboard_auth.js | 2 | nein |
| /api/auth/session | GET | backend/modules/dashboard_auth.js | 2 | nein |
| /api/auth/status | GET | backend/modules/dashboard_auth.js | 2 | nein |
| /api/auth/twitch | UNKNOWN | backend/modules/dashboard_auth.js | 2 | nein |
| /api/auth/twitch/callback | GET | backend/modules/dashboard_auth.js | 2 | nein |
| /api/auth/twitch/login | GET | backend/modules/dashboard_auth.js | 2 | nein |
| /api/clip/admin/settings | GET, POST | backend/modules/clips.js | 2 | nein |
| /api/clip/admin/texts | GET, POST | backend/modules/clips.js | 2 | nein |
| /api/dashboard/clips/settings | GET | backend/modules/clips.js | 1 | nein |
| /api/dashboard/clips/texts | GET | backend/modules/clips.js | 1 | nein |
| /api/dashboard/community/hug/hug-all-texts | GET | backend/modules/hug.js | 1 | nein |
| /api/dashboard/community/hug/response-texts | GET | backend/modules/hug.js | 1 | nein |
| /api/dashboard/community/hug/status | GET | backend/modules/hug.js | 2 | nein |
| /api/dashboard/community/hug/text-pairs | GET | backend/modules/hug.js | 1 | nein |
| /api/dashboard/community/hug/top-title-texts | GET | backend/modules/hug.js | 1 | nein |
| /api/dashboard/controlcenter/access | GET | backend/modules/dashboard_controlcenter.js | 2 | nein |
| /api/dashboard/controlcenter/admin-configs | GET | backend/modules/dashboard_controlcenter.js | 2 | nein |
| /api/dashboard/controlcenter/config/:id | GET, POST | backend/modules/dashboard_controlcenter.js | 4 | nein |
| /api/dashboard/controlcenter/logging | GET | backend/modules/dashboard_controlcenter.js | 2 | nein |
| /api/dashboard/controlcenter/navigation | GET | backend/modules/dashboard_controlcenter.js | 2 | nein |
| /api/dashboard/controlcenter/permissions | GET | backend/modules/dashboard_controlcenter.js | 2 | nein |
| /api/dashboard/controlcenter/roles | GET | backend/modules/dashboard_controlcenter.js | 2 | nein |
| /api/dashboard/controlcenter/status | GET | backend/modules/dashboard_controlcenter.js | 2 | nein |
| /api/dashboard/controlcenter/streamdesk | GET | backend/modules/dashboard_controlcenter.js | 2 | nein |
| /api/dashboard/controlcenter/twitch-auth | GET | backend/modules/dashboard_controlcenter.js | 2 | nein |
| /api/hug/admin/hug-all-texts | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/admin/response-texts | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/admin/text-pairs | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/admin/top-title-texts | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/message-rotator/admin/settings | GET, POST, UNKNOWN | backend/modules/message_rotator.js | 8 | nein |
| /api/message-rotator/admin/texts | GET, POST, UNKNOWN | backend/modules/message_rotator.js | 8 | nein |
| /api/obs/dashboard/config | GET | backend/modules/obs.js | 1 | nein |
| /api/security/status | UNKNOWN | backend/modules/security.js | 2 | nein |
| /api/tagebuch/admin/settings | GET, POST, UNKNOWN | backend/modules/tagebuch.js | 5 | nein |
| /api/tagebuch/admin/texts | GET, POST, UNKNOWN | backend/modules/tagebuch.js | 5 | nein |
| /api/todo/admin/settings | GET, POST, UNKNOWN | backend/modules/todo.js | 6 | nein |
| /api/todo/admin/texts | GET, POST, UNKNOWN | backend/modules/todo.js | 6 | nein |
| /auth/bot/callback | GET | backend/modules/twitch.js | 1 | nein |
| /auth/bot/login | GET | backend/modules/twitch.js | 1 | nein |
| /auth/bot/logout | GET | backend/modules/twitch.js | 1 | nein |
| /auth/bot/status | GET | backend/modules/twitch.js | 1 | nein |
| /auth/callback | GET | backend/modules/twitch.js | 1 | nein |
| /auth/login | GET | backend/modules/twitch.js | 1 | nein |
| /auth/logout | GET | backend/modules/twitch.js | 1 | nein |
| /auth/status | GET | backend/modules/twitch.js | 1 | nein |
| /auth/validate | GET | backend/modules/twitch.js | 1 | nein |
| /dashboard | USE | backend/server.js | 1 | nein |
| /message-rotator/admin/settings | GET, POST | backend/modules/message_rotator.js | 2 | nein |
| /message-rotator/admin/texts | GET, POST | backend/modules/message_rotator.js | 2 | nein |
| /twitch/auth/validate | GET | backend/modules/twitch.js | 1 | nein |

### diagnostics

| Route | Methoden | Dateien | Hits | Doku fehlt? |
|---|---|---|---:|---|
| /api/_status | GET | backend/server.js | 2 | nein |
| /api/audit/status | GET | backend/modules/audit_log.js | 2 | nein |
| /api/database/status | UNKNOWN | backend/modules/database_core.js | 1 | nein |
| /api/diag/env | UNKNOWN | backend/modules/diagnostics.js | 1 | nein |
| /api/diag/ping | UNKNOWN | backend/modules/diagnostics.js | 1 | nein |
| /api/diag/ws | UNKNOWN | backend/modules/diagnostics.js | 1 | nein |
| /api/loyalty/runner/status | GET | backend/modules/loyalty.js | 2 | nein |
| /api/loyalty/status | GET | backend/modules/loyalty.js | 2 | nein |
| /api/message-rotator/live-status | GET, POST, UNKNOWN | backend/modules/message_rotator.js | 6 | nein |
| /api/message-rotator/scheduler/status | GET, UNKNOWN | backend/modules/message_rotator_scheduler.js | 3 | nein |
| /api/message-rotator/status | GET, UNKNOWN | backend/modules/message_rotator.js | 5 | nein |
| /api/messages/scheduler/status | GET, UNKNOWN | backend/modules/messages.js | 3 | nein |
| /api/messages/status | GET, UNKNOWN | backend/modules/messages.js | 5 | nein |
| /api/stream-status | UNKNOWN | backend/modules/stream_status.js | 1 | nein |
| /message-rotator/live-status | GET, POST | backend/modules/message_rotator.js | 2 | nein |
| /message-rotator/status | GET | backend/modules/message_rotator.js | 1 | nein |
| /messages/scheduler/status | GET | backend/modules/messages.js | 1 | nein |
| /messages/status | GET | backend/modules/messages.js | 1 | nein |

### discord_tagebuch_todo

| Route | Methoden | Dateien | Hits | Doku fehlt? |
|---|---|---|---:|---|
| /api/discord | UNKNOWN | backend/modules/discord.js | 5 | nein |
| /api/discord/config | GET, UNKNOWN | backend/modules/discord.js | 4 | nein |
| /api/discord/integration-check | GET, UNKNOWN | backend/modules/discord.js | 4 | nein |
| /api/discord/join | GET, UNKNOWN | backend/modules/discord.js | 3 | nein |
| /api/discord/leave | GET, UNKNOWN | backend/modules/discord.js | 3 | nein |
| /api/discord/play | GET, UNKNOWN | backend/modules/discord.js | 3 | nein |
| /api/discord/post/channel | POST | backend/modules/discord.js | 3 | nein |
| /api/discord/post/message | POST | backend/modules/discord.js | 3 | nein |
| /api/discord/post/webhook | POST | backend/modules/discord.js | 3 | nein |
| /api/discord/queue/clear | GET, UNKNOWN | backend/modules/discord.js | 3 | nein |
| /api/discord/queue/status | GET, UNKNOWN | backend/modules/discord.js | 3 | nein |
| /api/discord/reload | POST, UNKNOWN | backend/modules/discord.js | 4 | nein |
| /api/discord/routes | GET, UNKNOWN | backend/modules/discord.js | 4 | nein |
| /api/discord/settings | GET, UNKNOWN | backend/modules/discord.js | 4 | nein |
| /api/discord/status | GET, UNKNOWN | backend/modules/discord.js | 3 | nein |
| /api/tagebuch | UNKNOWN | backend/modules/tagebuch.js | 1 | nein |
| /api/tagebuch/config | GET, UNKNOWN | backend/modules/tagebuch.js | 4 | nein |
| /api/tagebuch/config und /api/tagebuch/settings sind read-only Standard-Aliase. | UNKNOWN | backend/modules/tagebuch.js | 1 | ja |
| /api/tagebuch/entry | GET, POST, UNKNOWN | backend/modules/birthday.js, backend/modules/commands.js, backend/modules/tagebuch.js | 7 | nein |
| /api/tagebuch/integration-check | GET, UNKNOWN | backend/modules/tagebuch.js | 4 | nein |
| /api/tagebuch/reload | GET, POST, UNKNOWN | backend/modules/tagebuch.js | 6 | nein |
| /api/tagebuch/reset | GET, POST, UNKNOWN | backend/modules/tagebuch.js | 5 | nein |
| /api/tagebuch/routes | GET, UNKNOWN | backend/modules/tagebuch.js | 4 | nein |
| /api/tagebuch/settings | GET, UNKNOWN | backend/modules/tagebuch.js | 4 | nein |
| /api/tagebuch/stats | GET, UNKNOWN | backend/modules/tagebuch.js | 3 | nein |
| /api/tagebuch/stats/today | GET, UNKNOWN | backend/modules/commands.js, backend/modules/tagebuch.js | 4 | nein |
| /api/tagebuch/stats/top | GET | backend/modules/commands.js, backend/modules/tagebuch.js | 3 | nein |
| /api/tagebuch/stats/user | GET, UNKNOWN | backend/modules/tagebuch.js | 3 | nein |
| /api/tagebuch/status | GET, UNKNOWN | backend/modules/birthday.js, backend/modules/tagebuch.js | 5 | nein |
| /api/tagebuch/stream/end | GET, POST, UNKNOWN | backend/modules/tagebuch.js | 5 | nein |
| /api/tagebuch/stream/start | GET, POST, UNKNOWN | backend/modules/tagebuch.js | 5 | nein |
| /api/todo | UNKNOWN | backend/modules/todo.js | 1 | nein |
| /api/todo/add | GET, POST, UNKNOWN | backend/modules/todo.js | 6 | nein |
| /api/todo/config | GET, UNKNOWN | backend/modules/todo.js | 5 | nein |
| /api/todo/config und /api/todo/settings sind read-only Standard-Aliase. | UNKNOWN | backend/modules/todo.js | 1 | ja |
| /api/todo/integration-check | GET, UNKNOWN | backend/modules/todo.js | 5 | nein |
| /api/todo/reload | GET, POST, UNKNOWN | backend/modules/todo.js | 8 | nein |
| /api/todo/routes | GET, UNKNOWN | backend/modules/todo.js | 5 | nein |
| /api/todo/settings | GET, UNKNOWN | backend/modules/todo.js | 5 | nein |
| /api/todo/stats | GET, UNKNOWN | backend/modules/todo.js | 3 | nein |
| /api/todo/stats/today | GET, UNKNOWN | backend/modules/todo.js | 3 | nein |
| /api/todo/stats/top | GET | backend/modules/todo.js | 2 | nein |
| /api/todo/status | GET, UNKNOWN | backend/modules/todo.js | 5 | nein |
| /discord/stream/end | GET, POST | backend/modules/tagebuch.js | 2 | nein |
| /discord/stream/start | GET, POST | backend/modules/tagebuch.js | 2 | nein |
| /discord/tagebuch | GET, POST | backend/modules/tagebuch.js | 2 | nein |
| /discord/tagebuch/reset | GET, POST | backend/modules/tagebuch.js | 2 | nein |
| /discord/tagebuch/status | GET | backend/modules/tagebuch.js | 1 | nein |
| /discord/todo | GET, POST | backend/modules/todo.js | 2 | nein |
| /discord/todo/status | GET | backend/modules/todo.js | 1 | nein |

### obs_overlay

| Route | Methoden | Dateien | Hits | Doku fehlt? |
|---|---|---|---:|---|
| /api/chat-overlay | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | ja |
| /api/deathcounter/v2/overlay | GET | backend/modules/deathcounter_v2.js | 2 | nein |
| /api/deathcounter/v2/overlay/hide | GET, POST | backend/modules/deathcounter_v2.js | 4 | nein |
| /api/deathcounter/v2/overlay/players | POST | backend/modules/deathcounter_v2.js | 2 | nein |
| /api/deathcounter/v2/overlay/replace | GET, POST | backend/modules/deathcounter_v2.js | 4 | nein |
| /api/deathcounter/v2/overlay/resetplayers | GET | backend/modules/deathcounter_v2.js | 2 | nein |
| /api/deathcounter/v2/overlay/show | GET, POST | backend/modules/deathcounter_v2.js | 4 | nein |
| /api/deathcounter/v2/overlay/toggle | GET, POST | backend/modules/deathcounter_v2.js | 4 | nein |
| /api/obs | UNKNOWN | backend/modules/obs.js | 5 | nein |
| /api/obs/audio/mute | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/audio/state | GET | backend/modules/obs.js | 2 | nein |
| /api/obs/audio/toggle | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/audio/unmute | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/audio/volume | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/browser-sources | GET | backend/modules/obs.js | 2 | nein |
| /api/obs/config | GET, UNKNOWN | backend/modules/obs.js | 5 | nein |
| /api/obs/filter/disable | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/filter/enable | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/filter/list | GET | backend/modules/obs.js | 2 | nein |
| /api/obs/filter/toggle | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/integration-check | GET, UNKNOWN | backend/modules/obs.js | 5 | nein |
| /api/obs/reload | POST, UNKNOWN | backend/modules/obs.js | 5 | nein |
| /api/obs/replay/save | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/replay/start | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/replay/status | GET | backend/modules/obs.js | 2 | nein |
| /api/obs/replay/stop | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/routes | GET, UNKNOWN | backend/modules/obs.js | 5 | nein |
| /api/obs/scene/preview | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/scene/switch | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/scene-items | GET | backend/modules/obs.js | 2 | nein |
| /api/obs/scenes | GET | backend/modules/obs.js | 2 | nein |
| /api/obs/settings | GET, UNKNOWN | backend/modules/obs.js | 5 | nein |
| /api/obs/source/hide | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/source/show | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/source/toggle | POST | backend/modules/obs.js | 2 | nein |
| /api/obs/sources | GET | backend/modules/obs.js | 2 | nein |
| /api/obs/stats | GET | backend/modules/obs.js | 2 | nein |
| /api/obs/status | GET | backend/modules/obs.js | 2 | nein |
| /api/overlay/chat | UNKNOWN | backend/modules/twitch_chat_overlay.js | 4 | nein |
| /api/overlay/chat/clear | UNKNOWN | backend/modules/twitch_chat_overlay.js | 2 | nein |
| /api/overlay/chat/config | UNKNOWN | backend/modules/twitch_chat_overlay.js | 2 | nein |
| /api/overlay/chat/debug | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | nein |
| /api/overlay/chat/emotes/lookup | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | nein |
| /api/overlay/chat/emotes/reload | UNKNOWN | backend/modules/twitch_chat_overlay.js | 2 | nein |
| /api/overlay/chat/emotes/status | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | nein |
| /api/overlay/chat/integration-check | UNKNOWN | backend/modules/twitch_chat_overlay.js | 2 | nein |
| /api/overlay/chat/reconnect | UNKNOWN | backend/modules/twitch_chat_overlay.js | 2 | nein |
| /api/overlay/chat/reload | UNKNOWN | backend/modules/twitch_chat_overlay.js | 2 | nein |
| /api/overlay/chat/routes | UNKNOWN | backend/modules/twitch_chat_overlay.js | 2 | nein |
| /api/overlay/chat/settings | UNKNOWN | backend/modules/twitch_chat_overlay.js | 2 | nein |
| /api/overlay/chat/start | UNKNOWN | backend/modules/twitch_chat_overlay.js | 2 | nein |
| /api/overlay/chat/status | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | nein |
| /api/overlay/chat/stop | UNKNOWN | backend/modules/twitch_chat_overlay.js | 2 | nein |
| /api/overlay/start/config | UNKNOWN | backend/modules/start_overlay.js | 1 | nein |
| /api/overlay/start/reload | UNKNOWN | backend/modules/start_overlay.js | 2 | nein |
| /api/overlay/start/status | UNKNOWN | backend/modules/start_overlay.js | 1 | nein |
| /api/overlay/start-chat | UNKNOWN | backend/modules/start_overlay.js, backend/modules/twitch_chat_overlay.js | 3 | nein |
| /api/overlay/start-chat/clear | UNKNOWN | backend/modules/start_overlay.js | 2 | nein |
| /api/overlay/start-chat/clear-live | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | ja |
| /api/overlay/start-chat/debug | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | ja |
| /api/overlay/start-chat/emotes/lookup | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | ja |
| /api/overlay/start-chat/emotes/reload | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | ja |
| /api/overlay/start-chat/emotes/status | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | ja |
| /api/overlay/start-chat/irc | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | ja |
| /api/overlay/start-chat/irc/reconnect | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | ja |
| /api/overlay/start-chat/irc/start | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | ja |
| /api/overlay/start-chat/irc/status | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | ja |
| /api/overlay/start-chat/irc/stop | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | ja |
| /api/overlay/start-data | GET, UNKNOWN | backend/modules/overlay_data.js | 3 | nein |
| /api/scene | UNKNOWN | backend/modules/scene_control.js | 1 | nein |
| /api/scene/config | GET | backend/modules/scene_control.js | 4 | nein |
| /api/scene/health | GET | backend/modules/scene_control.js | 4 | nein |
| /api/scene/integration-check | GET | backend/modules/scene_control.js | 4 | nein |
| /api/scene/list | GET, UNKNOWN | backend/modules/scene_control.js | 5 | nein |
| /api/scene/reload | POST | backend/modules/scene_control.js | 4 | nein |
| /api/scene/routes | GET | backend/modules/scene_control.js | 4 | nein |
| /api/scene/set | GET, UNKNOWN | backend/modules/scene_control.js | 5 | nein |
| /api/scene/settings | GET | backend/modules/scene_control.js | 4 | nein |
| /api/scene/status | GET | backend/modules/scene_control.js | 4 | nein |
| /api/scene_control | UNKNOWN | backend/modules/scene_control.js | 1 | nein |
| /api/scene-control | UNKNOWN | backend/modules/scene_control.js | 1 | nein |
| /api/scenes | UNKNOWN | backend/modules/scene_control.js | 1 | nein |
| /api/twitch-chat-overlay | UNKNOWN | backend/modules/twitch_chat_overlay.js | 1 | ja |
| /overlays | USE | backend/server.js | 1 | nein |

### other

| Route | Methoden | Dateien | Hits | Doku fehlt? |
|---|---|---|---:|---|
| / | GET | backend/server.js | 1 | nein |
| /api/audit/clear-memory | GET, POST | backend/modules/audit_log.js | 4 | nein |
| /api/audit/recent | GET | backend/modules/audit_log.js | 2 | nein |
| /api/audit/test | GET | backend/modules/audit_log.js | 2 | nein |
| /api/loyalty/balance/:login | GET | backend/modules/loyalty.js | 2 | nein |
| /api/loyalty/config | GET | backend/modules/loyalty.js | 2 | nein |
| /api/loyalty/ignored-users | GET, POST | backend/modules/loyalty.js | 4 | nein |
| /api/loyalty/ignored-users/:login | DELETE | backend/modules/loyalty.js | 2 | nein |
| /api/loyalty/routes | GET | backend/modules/loyalty.js | 2 | nein |
| /api/loyalty/runner/run-once | GET, POST | backend/modules/loyalty.js | 4 | nein |
| /api/loyalty/runner/start | GET, POST | backend/modules/loyalty.js | 4 | nein |
| /api/loyalty/runner/stop | GET, POST | backend/modules/loyalty.js | 4 | nein |
| /api/loyalty/settings | GET, POST | backend/modules/loyalty.js | 4 | nein |
| /api/loyalty/stream-state | GET | backend/modules/loyalty.js | 2 | nein |
| /api/loyalty/stream-state/clear-override | GET, POST | backend/modules/loyalty.js | 4 | nein |
| /api/loyalty/stream-state/refresh-auto | GET, POST | backend/modules/loyalty.js | 4 | nein |
| /api/loyalty/stream-state/start | GET, POST | backend/modules/loyalty.js | 4 | nein |
| /api/loyalty/stream-state/stop | GET, POST | backend/modules/loyalty.js | 4 | nein |
| /api/loyalty/test/watch | GET | backend/modules/loyalty.js | 2 | nein |
| /api/loyalty/transactions | GET | backend/modules/loyalty.js | 2 | nein |
| /api/loyalty/transactions/adjust | POST | backend/modules/loyalty.js | 2 | nein |
| /api/loyalty/users | GET | backend/modules/loyalty.js | 2 | nein |
| /api/loyalty/users/:login | GET | backend/modules/loyalty.js | 2 | nein |
| /api/loyalty/watch/heartbeat | GET, POST | backend/modules/loyalty.js | 4 | nein |
| /api/loyalty/watch/states | GET | backend/modules/loyalty.js | 2 | nein |
| /api/message-rotator | UNKNOWN | backend/modules/message_rotator.js | 1 | nein |
| /api/message-rotator/config | GET, UNKNOWN | backend/modules/message_rotator.js | 5 | nein |
| /api/message-rotator/config und /api/message-rotator/settings sind read-only Standard-Aliase. | UNKNOWN | backend/modules/message_rotator.js | 1 | ja |
| /api/message-rotator/integration-check | GET, UNKNOWN | backend/modules/message_rotator.js | 5 | nein |
| /api/message-rotator/manual | GET, POST, UNKNOWN | backend/modules/message_rotator.js | 6 | nein |
| /api/message-rotator/next | GET, POST, UNKNOWN | backend/modules/message_rotator.js | 6 | nein |
| /api/message-rotator/reload | GET, POST, UNKNOWN | backend/modules/message_rotator.js | 8 | nein |
| /api/message-rotator/routes | GET, UNKNOWN | backend/modules/message_rotator.js | 5 | nein |
| /api/message-rotator/scheduler | UNKNOWN | backend/modules/message_rotator_scheduler.js | 1 | nein |
| /api/message-rotator/scheduler/reload | GET, UNKNOWN | backend/modules/message_rotator_scheduler.js | 3 | nein |
| /api/message-rotator/scheduler/routes | GET, UNKNOWN | backend/modules/message_rotator_scheduler.js | 3 | nein |
| /api/message-rotator/scheduler/run | GET, UNKNOWN | backend/modules/message_rotator_scheduler.js | 3 | nein |
| /api/message-rotator/scheduler/settings | GET, POST, UNKNOWN | backend/modules/message_rotator_scheduler.js | 6 | nein |
| /api/message-rotator/scheduler/start | GET, UNKNOWN | backend/modules/message_rotator_scheduler.js | 3 | nein |
| /api/message-rotator/scheduler/stop | GET, UNKNOWN | backend/modules/message_rotator_scheduler.js | 3 | nein |
| /api/message-rotator/settings | GET, UNKNOWN | backend/modules/message_rotator.js | 5 | nein |
| /api/message-rotator/start | GET, POST, UNKNOWN | backend/modules/message_rotator.js | 6 | nein |
| /api/message-rotator/stop | GET, POST, UNKNOWN | backend/modules/message_rotator.js | 6 | nein |
| /api/message-rotator/tick | GET, POST, UNKNOWN | backend/modules/message_rotator.js | 6 | nein |
| /api/messages | UNKNOWN | backend/modules/messages.js | 1 | nein |
| /api/messages/config | GET, UNKNOWN | backend/modules/messages.js | 5 | nein |
| /api/messages/config und /api/messages/settings sind read-only Standard-Aliase. | UNKNOWN | backend/modules/messages.js | 1 | ja |
| /api/messages/integration-check | GET, UNKNOWN | backend/modules/messages.js | 5 | nein |
| /api/messages/random | GET, POST, UNKNOWN | backend/modules/messages.js | 6 | nein |
| /api/messages/reload | GET, POST, UNKNOWN | backend/modules/messages.js | 8 | nein |
| /api/messages/render | GET, POST | backend/modules/messages.js | 4 | nein |
| /api/messages/routes | GET, UNKNOWN | backend/modules/messages.js | 5 | nein |
| /api/messages/scheduler/start | POST, UNKNOWN | backend/modules/messages.js | 3 | nein |
| /api/messages/scheduler/stop | POST, UNKNOWN | backend/modules/messages.js | 3 | nein |
| /api/messages/send | GET, POST, UNKNOWN | backend/modules/messages.js | 6 | nein |
| /api/messages/settings | GET, UNKNOWN | backend/modules/messages.js | 5 | nein |
| /assets | USE | backend/server.js | 1 | nein |
| /data | USE | backend/server.js | 1 | nein |
| /message-rotator/config | GET | backend/modules/message_rotator.js | 1 | nein |
| /message-rotator/integration-check | GET | backend/modules/message_rotator.js | 1 | nein |
| /message-rotator/manual | GET, POST | backend/modules/message_rotator.js | 2 | nein |
| /message-rotator/next | GET, POST | backend/modules/message_rotator.js | 2 | nein |
| /message-rotator/reload | GET, POST | backend/modules/message_rotator.js | 2 | nein |
| /message-rotator/routes | GET | backend/modules/message_rotator.js | 1 | nein |
| /message-rotator/settings | GET | backend/modules/message_rotator.js | 1 | nein |
| /message-rotator/start | GET, POST | backend/modules/message_rotator.js | 2 | nein |
| /message-rotator/stop | GET, POST | backend/modules/message_rotator.js | 2 | nein |
| /message-rotator/tick | GET, POST | backend/modules/message_rotator.js | 2 | nein |
| /messages/config | GET | backend/modules/messages.js | 1 | nein |
| /messages/integration-check | GET | backend/modules/messages.js | 1 | nein |
| /messages/random | GET, POST | backend/modules/messages.js | 2 | nein |
| /messages/reload | GET, POST | backend/modules/messages.js | 2 | nein |
| /messages/render | GET, POST | backend/modules/messages.js | 2 | nein |
| /messages/routes | GET | backend/modules/messages.js | 1 | nein |
| /messages/scheduler/start | POST | backend/modules/messages.js | 1 | nein |
| /messages/scheduler/stop | POST | backend/modules/messages.js | 1 | nein |
| /messages/send | GET, POST | backend/modules/messages.js | 2 | nein |
| /messages/settings | GET | backend/modules/messages.js | 1 | nein |
| /public | USE | backend/server.js | 1 | nein |
| /ws-client.js | GET | backend/server.js | 1 | nein |

### sound_media

| Route | Methoden | Dateien | Hits | Doku fehlt? |
|---|---|---|---:|---|
| /api/commands | UNKNOWN | backend/modules/commands.js, backend/modules/commands_media.js | 2 | nein |
| /api/communication/test-vip-overlay | GET | backend/modules/communication_bus.js | 2 | nein |
| /api/communication/test-vip-overlay-preview | GET | backend/modules/communication_bus.js | 2 | nein |
| /api/discord/sounds | GET, UNKNOWN | backend/modules/discord.js | 3 | nein |
| /api/media | UNKNOWN | backend/modules/media.js | 1 | nein |
| /api/obs/media/action | POST | backend/modules/obs.js | 2 | nein |
| /api/sound | GET, POST, UNKNOWN | backend/modules/sound_media_bridge.js, backend/modules/sound_output_config.js, backend/modules/sound_system.js | 20 | nein |
| /api/sound/bundle | POST | backend/modules/birthday.js | 1 | nein |
| /api/sound/eventbus/status | UNKNOWN | backend/modules/bus_diagnostics.js | 1 | nein |
| /api/sound/loudness | UNKNOWN | backend/modules/sound_loudness_scanner.js | 1 | nein |
| /api/sound/play-media | UNKNOWN | backend/modules/commands.js, backend/modules/commands_media.js, backend/modules/video_media_bridge.js | 3 | nein |
| /api/sound/status | GET | backend/modules/birthday.js | 2 | nein |
| /api/sound/stop | POST | backend/modules/birthday.js | 1 | nein |
| /api/soundalerts | UNKNOWN | backend/modules/soundalerts_bridge.js | 1 | nein |
| /api/soundalerts/config | GET, POST, UNKNOWN | backend/modules/soundalerts_bridge.js | 10 | nein |
| /api/soundalerts/entries | GET | backend/modules/soundalerts_bridge.js | 4 | nein |
| /api/soundalerts/entries/:entryKey | DELETE | backend/modules/soundalerts_bridge.js | 4 | nein |
| /api/soundalerts/entries/:entryKey/delete | POST | backend/modules/soundalerts_bridge.js | 4 | nein |
| /api/soundalerts/entries/:entryKey/ignore | POST | backend/modules/soundalerts_bridge.js | 4 | nein |
| /api/soundalerts/events | GET | backend/modules/soundalerts_bridge.js | 4 | nein |
| /api/soundalerts/integration-check | GET, UNKNOWN | backend/modules/soundalerts_bridge.js | 6 | nein |
| /api/soundalerts/integration-check ist als Read-only Diagnose-Endpunkt vorhanden. | UNKNOWN | backend/modules/soundalerts_bridge.js | 1 | ja |
| /api/soundalerts/reload | POST, UNKNOWN | backend/modules/soundalerts_bridge.js | 6 | nein |
| /api/soundalerts/routes | GET, UNKNOWN | backend/modules/soundalerts_bridge.js | 6 | nein |
| /api/soundalerts/settings | GET, POST, UNKNOWN | backend/modules/soundalerts_bridge.js | 10 | nein |
| /api/soundalerts/stats | GET | backend/modules/soundalerts_bridge.js | 4 | nein |
| /api/soundalerts/status | GET, UNKNOWN | backend/modules/soundalerts_bridge.js | 6 | nein |
| /api/soundalerts/test/chat | POST | backend/modules/soundalerts_bridge.js | 4 | nein |
| /api/soundalerts/upload | POST | backend/modules/soundalerts_bridge.js | 4 | nein |
| /api/tts/admin/settings | GET, POST | backend/modules/tts_system.js | 8 | nein |
| /api/tts/admin/texts | GET, POST | backend/modules/tts_system.js | 8 | nein |
| /api/tts/clear | ALL, UNKNOWN | backend/modules/tts_system.js | 3 | nein |
| /api/tts/command | ALL, UNKNOWN | backend/modules/tts_system.js | 3 | nein |
| /api/tts/config | GET | backend/modules/tts_system.js | 4 | nein |
| /api/tts/done | ALL, UNKNOWN | backend/modules/tts_system.js | 3 | nein |
| /api/tts/events | GET | backend/modules/tts_system.js | 4 | nein |
| /api/tts/integration-check | GET | backend/modules/tts_system.js | 4 | nein |
| /api/tts/off | ALL, UNKNOWN | backend/modules/tts_system.js | 3 | nein |
| /api/tts/on | ALL, UNKNOWN | backend/modules/tts_system.js | 3 | nein |
| /api/tts/overlay-state | GET | backend/modules/tts_system.js | 4 | nein |
| /api/tts/prepare-alert | ALL, UNKNOWN | backend/modules/tts_system.js | 3 | nein |
| /api/tts/reload | ALL, UNKNOWN | backend/modules/tts_system.js | 3 | nein |
| /api/tts/routes | GET | backend/modules/tts_system.js | 4 | nein |
| /api/tts/run | ALL, UNKNOWN | backend/modules/tts_system.js | 3 | nein |
| /api/tts/say | ALL, UNKNOWN | backend/modules/tts_system.js | 3 | nein |
| /api/tts/settings | GET | backend/modules/tts_system.js | 4 | nein |
| /api/tts/settings/upsert | POST | backend/modules/tts_system.js | 4 | nein |
| /api/tts/stats | GET | backend/modules/tts_system.js | 4 | nein |
| /api/tts/stats/users | GET | backend/modules/tts_system.js | 2 | nein |
| /api/tts/status | GET | backend/modules/tts_system.js | 4 | nein |
| /api/tts/stop | ALL, UNKNOWN | backend/modules/tts_system.js | 3 | nein |
| /api/tts/synthesize | ALL, UNKNOWN | backend/modules/tts_system.js | 3 | nein |
| /api/tts/voices | GET | backend/modules/tts_system.js | 4 | nein |
| /api/twitch/vips | UNKNOWN | backend/modules/twitch.js | 1 | ja |
| /api/video | UNKNOWN | backend/modules/video_media_bridge.js | 1 | nein |
| /api/vip | UNKNOWN | backend/modules/vip_sound_overlay.js | 1 | nein |
| /api/vip is intentionally not registered. | UNKNOWN | backend/modules/vip_sound_overlay.js | 1 | ja |
| /api/vip-sound | UNKNOWN | backend/modules/vip_sound_overlay.js | 1 | nein |
| /api/vip-sound/command | POST | backend/modules/commands.js | 2 | nein |
| /api/vip-sound/integration-check | UNKNOWN | backend/modules/bus_diagnostics.js | 1 | nein |
| /api/vip-sound/status | UNKNOWN | backend/modules/bus_diagnostics.js | 1 | nein |
| /api/vip-sound-overlay | UNKNOWN | backend/modules/vip_sound_overlay.js | 1 | nein |

### stream_features

| Route | Methoden | Dateien | Hits | Doku fehlt? |
|---|---|---|---:|---|
| /api/birthday | UNKNOWN | backend/modules/birthday.js | 1 | nein |
| /api/birthday/command | POST | backend/modules/birthday.js | 1 | nein |
| /api/challenge | UNKNOWN | backend/modules/challenge.js | 10 | nein |
| /api/challenge/config | UNKNOWN | backend/modules/challenge.js | 1 | nein |
| /api/challenge/integration-check | UNKNOWN | backend/modules/challenge.js | 1 | nein |
| /api/challenge/reload | UNKNOWN | backend/modules/challenge.js | 2 | nein |
| /api/challenge/remove | UNKNOWN | backend/modules/challenge.js | 2 | nein |
| /api/challenge/remove-next | UNKNOWN | backend/modules/challenge.js | 2 | nein |
| /api/challenge/reset | UNKNOWN | backend/modules/challenge.js | 2 | nein |
| /api/challenge/routes | UNKNOWN | backend/modules/challenge.js | 1 | nein |
| /api/challenge/settings | UNKNOWN | backend/modules/challenge.js | 1 | nein |
| /api/challenge/start | UNKNOWN | backend/modules/challenge.js | 2 | nein |
| /api/challenge/stats | UNKNOWN | backend/modules/challenge.js | 2 | nein |
| /api/challenge/stats/top | UNKNOWN | backend/modules/challenge.js | 1 | nein |
| /api/challenge/stats/user | UNKNOWN | backend/modules/challenge.js | 1 | nein |
| /api/challenge/status | UNKNOWN | backend/modules/challenge.js | 2 | nein |
| /api/clip | UNKNOWN | backend/modules/clips.js | 6 | nein |
| /api/clip/config | GET | backend/modules/clips.js | 2 | nein |
| /api/clip/create | GET, POST | backend/modules/clips.js | 4 | nein |
| /api/clip/history | GET | backend/modules/clips.js | 2 | nein |
| /api/clip/integration-check | GET | backend/modules/clips.js | 2 | nein |
| /api/clip/job/:jobId | GET | backend/modules/clips.js | 2 | nein |
| /api/clip/register | GET, POST | backend/modules/clips.js | 4 | nein |
| /api/clip/reload | POST | backend/modules/clips.js | 2 | nein |
| /api/clip/routes | GET | backend/modules/clips.js | 2 | nein |
| /api/clip/settings | GET | backend/modules/clips.js | 2 | nein |
| /api/clip/shoutout | GET, POST | backend/modules/clip_shoutout.js | 5 | nein |
| /api/clip/status | GET | backend/modules/clips.js | 2 | nein |
| /api/clip/title | GET | backend/modules/clips.js | 2 | nein |
| /api/clips | UNKNOWN | backend/modules/clips.js | 2 | nein |
| /api/clips is intentionally not registered; productive prefix remains /api/clip. | UNKNOWN | backend/modules/clips.js | 1 | ja |
| /api/clip-shoutout | UNKNOWN | backend/modules/clip_shoutout.js | 1 | nein |
| /api/credits | UNKNOWN | backend/modules/credits.js | 1 | nein |
| /api/deathcounter | UNKNOWN | backend/modules/deathcounter_v2.js | 1 | nein |
| /api/deathcounter/v2 | UNKNOWN, USE | backend/modules/deathcounter_v2.js | 3 | nein |
| /api/deathcounter/v2/command | GET, POST | backend/modules/commands.js, backend/modules/deathcounter_v2.js | 14 | nein |
| /api/deathcounter/v2/del | GET, POST | backend/modules/deathcounter_v2.js | 4 | nein |
| /api/deathcounter/v2/game | GET, POST | backend/modules/deathcounter_v2.js | 4 | nein |
| /api/deathcounter/v2/game/set | GET | backend/modules/deathcounter_v2.js | 2 | nein |
| /api/deathcounter/v2/hide | GET, POST | backend/modules/deathcounter_v2.js | 4 | nein |
| /api/deathcounter/v2/players | GET, POST | backend/modules/deathcounter_v2.js | 4 | nein |
| /api/deathcounter/v2/rip | GET, POST | backend/modules/deathcounter_v2.js | 4 | nein |
| /api/deathcounter/v2/session-reset | POST | backend/modules/deathcounter_v2.js | 2 | nein |
| /api/deathcounter/v2/show | GET, POST | backend/modules/deathcounter_v2.js | 4 | nein |
| /api/deathcounter/v2/state | GET | backend/modules/deathcounter_v2.js | 2 | nein |
| /api/deathcounter/v2/stream-online-sync | GET | backend/modules/deathcounter_v2.js | 2 | nein |
| /api/deathcounter/v2/sync/channelinfo | GET | backend/modules/deathcounter_v2.js | 2 | nein |
| /api/deathcounter/v2/tode | GET | backend/modules/deathcounter_v2.js | 2 | nein |
| /api/deathcounter/v2/total-reset | POST | backend/modules/deathcounter_v2.js | 2 | nein |
| /api/fireworks | GET | backend/modules/fireworks_api.js, backend/server.js | 4 | nein |
| /api/fireworks/clear | GET | backend/modules/fireworks_api.js, backend/server.js | 4 | nein |
| /api/fireworks/stop | GET | backend/modules/fireworks_api.js, backend/server.js | 4 | nein |
| /api/hug | UNKNOWN | backend/modules/hug.js | 5 | nein |
| /api/hug/action | POST, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/cmd | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/command | GET, POST, UNKNOWN | backend/modules/commands.js, backend/modules/hug.js | 12 | nein |
| /api/hug/config | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/db/output-mode | GET, POST, UNKNOWN | backend/modules/hug.js | 6 | nein |
| /api/hug/db/status | GET | backend/modules/hug.js | 2 | nein |
| /api/hug/integration-check | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/reload | GET, POST, UNKNOWN | backend/modules/hug.js | 6 | nein |
| /api/hug/routes | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/settings | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/stats | POST, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/statscmd | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/status | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/texts | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/text-store/reload | POST, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/text-store/status | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/top | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/hug/types | GET, UNKNOWN | backend/modules/hug.js | 3 | nein |
| /api/rehug | UNKNOWN | backend/modules/hug.js | 1 | nein |
| /api/stream-status/status | GET | backend/modules/clip_shoutout.js | 2 | nein |

### twitch_chat

| Route | Methoden | Dateien | Hits | Doku fehlt? |
|---|---|---|---:|---|
| /api/chat-output/reload | UNKNOWN | backend/modules/chat_output.js | 1 | nein |
| /api/chat-output/send | UNKNOWN | backend/modules/chat_output.js | 1 | nein |
| /api/chat-output/status | UNKNOWN | backend/modules/chat_output.js | 1 | nein |
| /api/loyalty/presence/run-once | GET, POST | backend/modules/loyalty.js | 4 | nein |
| /api/loyalty/presence/status | GET | backend/modules/loyalty.js | 2 | nein |
| /api/twitch/badges | UNKNOWN | backend/modules/twitch.js | 1 | ja |
| /api/twitch/channel | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/channel/summary | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/chat/settings | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/chatters | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/cheermotes/reload | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/cheermotes/status | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/clips | UNKNOWN | backend/modules/twitch.js | 1 | ja |
| /api/twitch/emotes | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/followers | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/goals | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/hypetrain | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/hypetrain/raw | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/moderators | UNKNOWN | backend/modules/twitch.js | 1 | ja |
| /api/twitch/polls | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/predictions | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/presence | UNKNOWN | backend/modules/twitch_presence.js | 5 | nein |
| /api/twitch/presence/activity | GET, UNKNOWN | backend/modules/twitch_presence.js | 4 | nein |
| /api/twitch/presence/activity/active | GET, UNKNOWN | backend/modules/twitch_presence.js | 4 | nein |
| /api/twitch/presence/activity/clear | POST, UNKNOWN | backend/modules/twitch_presence.js | 4 | nein |
| /api/twitch/presence/activity/test | GET, UNKNOWN | backend/modules/twitch_presence.js | 4 | nein |
| /api/twitch/presence/config | GET, UNKNOWN | backend/modules/twitch_presence.js | 4 | nein |
| /api/twitch/presence/integration-check | GET, UNKNOWN | backend/modules/twitch_presence.js | 4 | nein |
| /api/twitch/presence/reload | POST, UNKNOWN | backend/modules/twitch_presence.js | 4 | nein |
| /api/twitch/presence/routes | GET, UNKNOWN | backend/modules/twitch_presence.js | 4 | nein |
| /api/twitch/presence/send | GET, UNKNOWN | backend/modules/twitch_presence.js | 3 | nein |
| /api/twitch/presence/settings | GET, UNKNOWN | backend/modules/twitch_presence.js | 4 | nein |
| /api/twitch/presence/start | GET, UNKNOWN | backend/modules/twitch_presence.js | 3 | nein |
| /api/twitch/presence/status | GET, UNKNOWN | backend/modules/birthday.js, backend/modules/twitch_presence.js | 4 | nein |
| /api/twitch/presence/stop | GET, UNKNOWN | backend/modules/twitch_presence.js | 3 | nein |
| /api/twitch/raids | UNKNOWN | backend/modules/twitch.js | 1 | ja |
| /api/twitch/rewards | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/schedule | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/stream | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/stream/summary | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/user | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/user/by-id | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/user/resolve | UNKNOWN | backend/modules/twitch.js | 1 | nein |
| /api/twitch/videos | UNKNOWN | backend/modules/twitch.js | 1 | ja |
| /twitch/me | GET | backend/modules/twitch.js | 1 | nein |

## Naechster Schritt

STEP595 - Routes Inventory Review and Docs Update Plan

Ziel: Die Routen-Inventur fachlich pruefen, offensichtliche False-Positives markieren und anschliessend gezielt Modul-Dokus aktualisieren.

<!-- STEP596_MISSING_ROUTES_DOC_BATCH_START -->

## STEP596 Missing Routes Documentation Batch

Stand: 2026-05-30

Dieser Abschnitt dokumentiert gezielt die in STEP591 bis STEP595 gefundenen Routen, die im bisherigen Doku-Text noch nicht erwaehnt wurden.

Wichtig: Auch diese Liste ist scanbasiert. Jede Route muss vor produktiven Entscheidungen in der echten Moduldatei geprueft werden.

### Zusammenfassung

Missing routes total: 26
Bereiche: 7
Quelle: system-scan-output/step595_missing_routes_review.tsv
Generated: 2026-05-30 11:08:27

### Missing Routes nach Bereichen

| Bereich | Routes | High Priority | Review Priority |
|---|---:|---:|---:|
| obs_overlay | 12 | 0 | 12 |
| twitch_chat | 5 | 0 | 5 |
| sound_media | 3 | 0 | 3 |
| other | 2 | 0 | 2 |
| discord_tagebuch_todo | 2 | 0 | 2 |
| alerts | 1 | 0 | 1 |
| stream_features | 1 | 0 | 1 |

### Detail-Liste

| Priority | Bereich | Risk | Route | Methods | Files | Hinweis |
|---|---|---|---|---|---|---|
| review | alerts | unknown_method | /api/alerts/bus-mirror/enable?confirm=1 | UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| review | discord_tagebuch_todo | unknown_method | /api/tagebuch/config und /api/tagebuch/settings sind read-only Standard-Aliase. | UNKNOWN | backend/modules/tagebuch.js | Method not clearly detected; verify whether this is a real route. |
| review | discord_tagebuch_todo | unknown_method | /api/todo/config und /api/todo/settings sind read-only Standard-Aliase. | UNKNOWN | backend/modules/todo.js | Method not clearly detected; verify whether this is a real route. |
| review | obs_overlay | unknown_method | /api/chat-overlay | UNKNOWN | backend/modules/twitch_chat_overlay.js | Method not clearly detected; verify whether this is a real route. |
| review | obs_overlay | unknown_method | /api/overlay/start-chat/clear-live | UNKNOWN | backend/modules/twitch_chat_overlay.js | Method not clearly detected; verify whether this is a real route. |
| review | obs_overlay | unknown_method | /api/overlay/start-chat/debug | UNKNOWN | backend/modules/twitch_chat_overlay.js | Method not clearly detected; verify whether this is a real route. |
| review | obs_overlay | unknown_method | /api/overlay/start-chat/emotes/lookup | UNKNOWN | backend/modules/twitch_chat_overlay.js | Method not clearly detected; verify whether this is a real route. |
| review | obs_overlay | unknown_method | /api/overlay/start-chat/emotes/reload | UNKNOWN | backend/modules/twitch_chat_overlay.js | Method not clearly detected; verify whether this is a real route. |
| review | obs_overlay | unknown_method | /api/overlay/start-chat/emotes/status | UNKNOWN | backend/modules/twitch_chat_overlay.js | Method not clearly detected; verify whether this is a real route. |
| review | obs_overlay | unknown_method | /api/overlay/start-chat/irc | UNKNOWN | backend/modules/twitch_chat_overlay.js | Method not clearly detected; verify whether this is a real route. |
| review | obs_overlay | unknown_method | /api/overlay/start-chat/irc/reconnect | UNKNOWN | backend/modules/twitch_chat_overlay.js | Method not clearly detected; verify whether this is a real route. |
| review | obs_overlay | unknown_method | /api/overlay/start-chat/irc/start | UNKNOWN | backend/modules/twitch_chat_overlay.js | Method not clearly detected; verify whether this is a real route. |
| review | obs_overlay | unknown_method | /api/overlay/start-chat/irc/status | UNKNOWN | backend/modules/twitch_chat_overlay.js | Method not clearly detected; verify whether this is a real route. |
| review | obs_overlay | unknown_method | /api/overlay/start-chat/irc/stop | UNKNOWN | backend/modules/twitch_chat_overlay.js | Method not clearly detected; verify whether this is a real route. |
| review | obs_overlay | unknown_method | /api/twitch-chat-overlay | UNKNOWN | backend/modules/twitch_chat_overlay.js | Method not clearly detected; verify whether this is a real route. |
| review | other | unknown_method | /api/message-rotator/config und /api/message-rotator/settings sind read-only Standard-Aliase. | UNKNOWN | backend/modules/message_rotator.js | Method not clearly detected; verify whether this is a real route. |
| review | other | unknown_method | /api/messages/config und /api/messages/settings sind read-only Standard-Aliase. | UNKNOWN | backend/modules/messages.js | Method not clearly detected; verify whether this is a real route. |
| review | sound_media | unknown_method | /api/soundalerts/integration-check ist als Read-only Diagnose-Endpunkt vorhanden. | UNKNOWN | backend/modules/soundalerts_bridge.js | Method not clearly detected; verify whether this is a real route. |
| review | sound_media | unknown_method | /api/twitch/vips | UNKNOWN | backend/modules/twitch.js | Method not clearly detected; verify whether this is a real route. |
| review | sound_media | unknown_method | /api/vip is intentionally not registered. | UNKNOWN | backend/modules/vip_sound_overlay.js | Method not clearly detected; verify whether this is a real route. |
| review | stream_features | unknown_method | /api/clips is intentionally not registered; productive prefix remains /api/clip. | UNKNOWN | backend/modules/clips.js | Method not clearly detected; verify whether this is a real route. |
| review | twitch_chat | unknown_method | /api/twitch/badges | UNKNOWN | backend/modules/twitch.js | Method not clearly detected; verify whether this is a real route. |
| review | twitch_chat | unknown_method | /api/twitch/clips | UNKNOWN | backend/modules/twitch.js | Method not clearly detected; verify whether this is a real route. |
| review | twitch_chat | unknown_method | /api/twitch/moderators | UNKNOWN | backend/modules/twitch.js | Method not clearly detected; verify whether this is a real route. |
| review | twitch_chat | unknown_method | /api/twitch/raids | UNKNOWN | backend/modules/twitch.js | Method not clearly detected; verify whether this is a real route. |
| review | twitch_chat | unknown_method | /api/twitch/videos | UNKNOWN | backend/modules/twitch.js | Method not clearly detected; verify whether this is a real route. |

### Doku-Zielbereiche aus STEP595

Diese Zielbereiche sind nur eine Planungsgrundlage. Es werden mit diesem STEP keine Modul-Dokus automatisch geaendert.

| Ziel-Doku | Module | High Priority Modules | Route Hits |
|---|---:|---:|---:|
| docs/backend/ROUTES.md | 20 | 14 | 831 |
| docs/modules/sound_system_channelpoints_routing.md | 10 | 3 | 200 |
| docs/current/CURRENT_SYSTEM_STATUS.md | 8 | 4 | 394 |
| docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md | 3 | 2 | 42 |
| docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md | 2 | 2 | 39 |
| docs/modules/channelpoints.md | 1 | 0 | 1 |
| docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md | 1 | 0 | 8 |

### Naechster Schritt

STEP597 - Route Inventory False-Positive Review

Ziel: Die 357 False-Positive-Kandidaten aus STEP595 nicht blind uebernehmen, sondern nach Risiko gruppieren und nur sinnvolle Doku-Hinweise ableiten.

<!-- STEP596_MISSING_ROUTES_DOC_BATCH_END -->

<!-- STEP597_FALSE_POSITIVE_REVIEW_START -->

## STEP597 False-Positive Review Hinweise

Stand: 2026-05-30

Dieser Abschnitt dokumentiert die aus STEP595 erkannten False-Positive-Kandidaten der scanbasierten Routen-Inventur.

Wichtig: Diese Kandidaten duerfen nicht automatisch als echte produktive Routen behandelt werden.

### Zusammenfassung

False-positive candidates total: 357
Risiko-Gruppen: 4
Bereiche: 11
Quelle: system-scan-output/step595_false_positive_candidates.tsv
Generated: 2026-05-30 11:11:05

### Risiko-Gruppen

| Risiko | Count | High Priority | Review Priority | Missing Doc Mention |
|---|---:|---:|---:|---:|
| unknown_method | 331 | 0 | 331 | 26 |
| dynamic_or_pattern | 22 | 0 | 22 | 0 |
| possible_example | 3 | 0 | 0 | 0 |
| many_hits | 1 | 0 | 0 | 0 |

### Bereiche

| Bereich | Count | Dynamic/Pattern | Unknown Method | Many Hits |
|---|---:|---:|---:|---:|
| alerts | 84 | 13 | 71 | 0 |
| obs_overlay | 45 | 0 | 45 | 0 |
| stream_features | 43 | 1 | 41 | 1 |
| twitch_chat | 42 | 0 | 42 | 0 |
| discord_tagebuch_todo | 41 | 0 | 38 | 0 |
| sound_media | 37 | 3 | 34 | 0 |
| other | 33 | 3 | 30 | 0 |
| dashboard_admin_security | 13 | 1 | 12 | 0 |
| diagnostics | 10 | 0 | 10 | 0 |
| communication_bus | 5 | 1 | 4 | 0 |
| channelpoints | 4 | 0 | 4 | 0 |

### Review-Auszug

Die folgende Liste ist bewusst begrenzt. Vollstaendige Details liegen in system-scan-output/step595_false_positive_candidates.tsv.

| Risk | Area | Route | Methods | Files | Note |
|---|---|---|---|---|---|
| dynamic_or_pattern | alerts | /api/alerts/assets/:id | DELETE, UNKNOWN | backend/modules/alert_system.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | alerts | /api/alerts/assets/:id/usage | GET, UNKNOWN | backend/modules/alert_system.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | alerts | /api/alerts/chat-blocks/:id | DELETE, PUT, UNKNOWN | backend/modules/alert_system.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | alerts | /api/alerts/chat-outbox/:id/consumed | POST, UNKNOWN | backend/modules/alert_system.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | alerts | /api/alerts/chat-outbox/:id/error | POST, UNKNOWN | backend/modules/alert_system.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | alerts | /api/alerts/chat-outbox/:id/sent | POST, UNKNOWN | backend/modules/alert_system.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | alerts | /api/alerts/display-profiles/:id | DELETE, PUT, UNKNOWN | backend/modules/alert_system.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | alerts | /api/alerts/display-profiles/:id/play | POST, UNKNOWN | backend/modules/alert_system.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | alerts | /api/alerts/events/:eventUid/replay | POST, UNKNOWN | backend/modules/alert_system.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | alerts | /api/alerts/rules/:id | DELETE, PUT, UNKNOWN | backend/modules/alert_system.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | alerts | /api/alerts/test-presets/:id | DELETE, PUT, UNKNOWN | backend/modules/alert_system.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | alerts | /api/alerts/test-presets/:id/play | POST, UNKNOWN | backend/modules/alert_system.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | alerts | /api/alerts/text-variants/:id | DELETE, PUT, UNKNOWN | backend/modules/alert_system.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | communication_bus | /api/loyalty/events/test/:type | GET | backend/modules/loyalty.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | dashboard_admin_security | /api/dashboard/controlcenter/config/:id | GET, POST | backend/modules/dashboard_controlcenter.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | other | /api/loyalty/balance/:login | GET | backend/modules/loyalty.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | other | /api/loyalty/ignored-users/:login | DELETE | backend/modules/loyalty.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | other | /api/loyalty/users/:login | GET | backend/modules/loyalty.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | sound_media | /api/soundalerts/entries/:entryKey | DELETE | backend/modules/soundalerts_bridge.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | sound_media | /api/soundalerts/entries/:entryKey/delete | POST | backend/modules/soundalerts_bridge.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | sound_media | /api/soundalerts/entries/:entryKey/ignore | POST | backend/modules/soundalerts_bridge.js | Route contains dynamic/pattern-like tokens; verify in source. |
| dynamic_or_pattern | stream_features | /api/clip/job/:jobId | GET | backend/modules/clips.js | Route contains dynamic/pattern-like tokens; verify in source. |
| many_hits | stream_features | /api/deathcounter/v2/command | GET, POST | backend/modules/commands.js, backend/modules/deathcounter_v2.js | Many hits for same route; could be reused constant or repeated mention. |
| possible_example | discord_tagebuch_todo | /api/todo/stats/top | GET | backend/modules/todo.js | Looks like example/placeholder; verify before documenting as real. |
| possible_example | discord_tagebuch_todo | /discord/todo | GET, POST | backend/modules/todo.js | Looks like example/placeholder; verify before documenting as real. |
| possible_example | discord_tagebuch_todo | /discord/todo/status | GET | backend/modules/todo.js | Looks like example/placeholder; verify before documenting as real. |
| unknown_method | alerts | /api/alerts | UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/assets | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/assets/scan-durations | POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/assets/upload | POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/bus-mirror/disable | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/bus-mirror/enable | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/bus-mirror/enable?confirm=1 | UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/bus-mirror/status | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/chat-blocks | GET, POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/chat-outbox | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/clear | POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/config | GET, POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/display-profiles | GET, POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/enqueue | POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/eventbus/correlation/check | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/eventbus/correlation/status | GET, UNKNOWN | backend/modules/alert_system.js, backend/modules/bus_diagnostics.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/eventbus/reset | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/eventbus/status | GET, UNKNOWN | backend/modules/alert_system.js, backend/modules/bus_diagnostics.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/eventbus/test | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/events | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/health | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/integration-check | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/kofi/config | UNKNOWN | backend/modules/kofi.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/kofi/reload | UNKNOWN | backend/modules/kofi.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/kofi/status | UNKNOWN | backend/modules/kofi.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/kofi/test | UNKNOWN | backend/modules/kofi.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/kofi/webhook | UNKNOWN | backend/modules/kofi.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/overlay-watchdog/check | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/overlay-watchdog/recover | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/overlay-watchdog/recover?confirm=1 | UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/overlay-watchdog/reset | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/overlay-watchdog/reset?confirm=1 | UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/overlay-watchdog/status | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/queue | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/reload | POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/routes | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/rules | GET, POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/rules/validate | POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/settings | GET, POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/status | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/test | POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/test-presets | GET, POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/text-variants | GET, POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/tipeee/config | UNKNOWN | backend/modules/tipeee.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/tipeee/connect | UNKNOWN | backend/modules/tipeee.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/tipeee/disconnect | UNKNOWN | backend/modules/tipeee.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/tipeee/events/recent | UNKNOWN | backend/modules/tipeee.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/tipeee/reconnect | UNKNOWN | backend/modules/tipeee.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/tipeee/reload | UNKNOWN | backend/modules/tipeee.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/tipeee/status | UNKNOWN | backend/modules/tipeee.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/tipeee/test | UNKNOWN | backend/modules/tipeee.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/tipeee/webhook | UNKNOWN | backend/modules/tipeee.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/twitch | POST, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |
| unknown_method | alerts | /api/alerts/twitch/bits | GET, UNKNOWN | backend/modules/alert_system.js | Method not clearly detected; verify whether this is a real route. |

### Arbeitsregel fuer folgende Doku-Steps

1. Ein Kandidat mit unknown_method, dynamic_or_pattern oder many_hits wird nicht automatisch als Route dokumentiert.
2. Zuerst die echte Moduldatei und den Express-/Router-Kontext pruefen.
3. Nur bestaetigte Routen in Modul-Dokus uebernehmen.
4. Unbestaetigte Kandidaten bleiben als Scan-Hinweis in dieser Inventur.

### Naechster Schritt

STEP598 - Module Route Docs Batch Plan

Ziel: Aus bestaetigbaren Routen und den STEP595-Zielbereichen kleine Modul-Doku-Batches planen.

<!-- STEP597_FALSE_POSITIVE_REVIEW_END -->

