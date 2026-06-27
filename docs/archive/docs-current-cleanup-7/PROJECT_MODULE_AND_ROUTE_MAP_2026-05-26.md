# PROJECT_MODULE_AND_ROUTE_MAP_2026-05-26

## Zweck

Automatisch erzeugte Routen-/Modulkarte aus dem hochgeladenen Backend-ZIP. Sie dient als Doku- und Cleanup-Grundlage. Dynamische oder indirekt registrierte Routen koennen fehlen.

## Quelle

```text
backend.zip
```

## `backend/modules/alert_system.js`

Version: `nicht erkannt`

- `ROUTE /api/alerts/assets`
- `ROUTE /api/alerts/assets/:id/usage`
- `ROUTE /api/alerts/assets/scan-durations`
- `ROUTE /api/alerts/assets/upload`
- `ROUTE /api/alerts/bus-mirror/disable`
- `ROUTE /api/alerts/bus-mirror/enable`
- `ROUTE /api/alerts/bus-mirror/status`
- `ROUTE /api/alerts/chat-blocks`
- `ROUTE /api/alerts/chat-outbox`
- `ROUTE /api/alerts/chat-outbox/:id/consumed`
- `ROUTE /api/alerts/chat-outbox/:id/error`
- `ROUTE /api/alerts/chat-outbox/:id/sent`
- `ROUTE /api/alerts/clear`
- `ROUTE /api/alerts/config`
- `ROUTE /api/alerts/display-profiles`
- `ROUTE /api/alerts/display-profiles/:id/play`
- `ROUTE /api/alerts/enqueue`
- `ROUTE /api/alerts/eventbus/correlation/check`
- `ROUTE /api/alerts/eventbus/correlation/status`
- `ROUTE /api/alerts/eventbus/reset`
- `ROUTE /api/alerts/eventbus/status`
- `ROUTE /api/alerts/eventbus/test`
- `ROUTE /api/alerts/events`
- `ROUTE /api/alerts/events/:eventUid/replay`
- `ROUTE /api/alerts/health`
- `ROUTE /api/alerts/integration-check`
- `ROUTE /api/alerts/overlay-watchdog/check`
- `ROUTE /api/alerts/overlay-watchdog/recover`
- `ROUTE /api/alerts/overlay-watchdog/reset`
- `ROUTE /api/alerts/overlay-watchdog/status`
- `ROUTE /api/alerts/queue`
- `ROUTE /api/alerts/reload`
- `ROUTE /api/alerts/routes`
- `ROUTE /api/alerts/rules`
- `ROUTE /api/alerts/rules/validate`
- `ROUTE /api/alerts/settings`
- `ROUTE /api/alerts/status`
- `ROUTE /api/alerts/test`
- `ROUTE /api/alerts/test-presets`
- `ROUTE /api/alerts/test-presets/:id/play`
- `ROUTE /api/alerts/text-variants`
- `ROUTE /api/alerts/twitch`
- `ROUTE /api/alerts/twitch/bits`
- `ROUTE /api/alerts/twitch/follow`
- `ROUTE /api/alerts/twitch/raid`

## `backend/modules/audit_log.js`

Version: `0.2.0`

- `GET /api/audit/clear-memory`
- `GET /api/audit/recent`
- `GET /api/audit/status`
- `GET /api/audit/test`
- `POST /api/audit/clear-memory`

## `backend/modules/bus_diagnostics.js`

Version: `1.1.0`

- `GET /api/bus-diagnostics/check`
- `GET /api/bus-diagnostics/status`
- `ROUTE /api/bus-diagnostics/check`
- `ROUTE /api/bus-diagnostics/routes`
- `ROUTE /api/bus-diagnostics/status`

## `backend/modules/challenge.js`

Version: `nicht erkannt`

- `ROUTE /api/challenge`
- `ROUTE /api/challenge/config`
- `ROUTE /api/challenge/integration-check`
- `ROUTE /api/challenge/reload`
- `ROUTE /api/challenge/remove`
- `ROUTE /api/challenge/remove-next`
- `ROUTE /api/challenge/reset`
- `ROUTE /api/challenge/routes`
- `ROUTE /api/challenge/settings`
- `ROUTE /api/challenge/start`
- `ROUTE /api/challenge/stats`
- `ROUTE /api/challenge/stats/top`
- `ROUTE /api/challenge/stats/user`
- `ROUTE /api/challenge/status`

## `backend/modules/chat_output.js`

Version: `nicht erkannt`

- `ROUTE /api/chat-output/reload`
- `ROUTE /api/chat-output/send`
- `ROUTE /api/chat-output/status`

## `backend/modules/clip_shoutout.js`

Version: `nicht erkannt`

- `GET /api/clip/shoutout`
- `GET/POST /api/clip/shoutout`
- `POST /api/clip/shoutout`
- `POST /api/stream-status/status`

## `backend/modules/clips.js`

Version: `nicht erkannt`

- `GET /api/clip/config`
- `GET /api/clip/create`
- `GET /api/clip/history`
- `GET /api/clip/integration-check`
- `GET /api/clip/job/:jobId`
- `GET /api/clip/register`
- `GET /api/clip/routes`
- `GET /api/clip/settings`
- `GET /api/clip/status`
- `GET /api/clip/title`
- `GET /api/dashboard/clips/texts`
- `GET/POST /api/dashboard/clips/settings`
- `POST /api/clip/create`
- `POST /api/clip/register`
- `POST /api/clip/reload`

## `backend/modules/communication_bus.js`

Version: `0.8.1`

- `GET /api/communication/ack`
- `GET /api/communication/client/forget`
- `GET /api/communication/issue`
- `GET /api/communication/mirror-alert`
- `GET /api/communication/replay`
- `GET /api/communication/reset`
- `GET /api/communication/status`
- `GET /api/communication/test`
- `GET /api/communication/test-alert`
- `GET /api/communication/test-vip-overlay`
- `GET /api/communication/test-vip-overlay-preview`
- `GET /api/communication/watchdog`

## `backend/modules/credits.js`

Version: `nicht erkannt`

- `ROUTE /api/credits`

## `backend/modules/dashboard_auth.js`

Version: `nicht erkannt`

- `GET /api/auth/audit`
- `GET /api/auth/roles`
- `GET /api/auth/session`
- `GET /api/auth/status`
- `GET /api/auth/twitch/callback`
- `GET /api/auth/twitch/login`
- `POST /api/auth/bootstrap-owner-local`
- `POST /api/auth/logout`

## `backend/modules/dashboard_controlcenter.js`

Version: `nicht erkannt`

- `GET /api/dashboard/controlcenter/access`
- `GET /api/dashboard/controlcenter/admin-configs`
- `GET /api/dashboard/controlcenter/config/:id`
- `GET /api/dashboard/controlcenter/logging`
- `GET /api/dashboard/controlcenter/navigation`
- `GET /api/dashboard/controlcenter/permissions`
- `GET /api/dashboard/controlcenter/roles`
- `GET /api/dashboard/controlcenter/status`
- `GET /api/dashboard/controlcenter/streamdesk`
- `GET /api/dashboard/controlcenter/twitch-auth`
- `POST /api/dashboard/controlcenter/config/:id`

## `backend/modules/database_core.js`

Version: `nicht erkannt`

- `ROUTE /api/database/status`

## `backend/modules/deathcounter_v2.js`

Version: `nicht erkannt`

- `GET /api/deathcounter/v2/command`
- `GET /api/deathcounter/v2/del`
- `GET /api/deathcounter/v2/game`
- `GET /api/deathcounter/v2/game/set`
- `GET /api/deathcounter/v2/hide`
- `GET /api/deathcounter/v2/overlay`
- `GET /api/deathcounter/v2/overlay/hide`
- `GET /api/deathcounter/v2/overlay/replace`
- `GET /api/deathcounter/v2/overlay/resetplayers`
- `GET /api/deathcounter/v2/overlay/show`
- `GET /api/deathcounter/v2/overlay/toggle`
- `GET /api/deathcounter/v2/players`
- `GET /api/deathcounter/v2/rip`
- `GET /api/deathcounter/v2/show`
- `GET /api/deathcounter/v2/state`
- `GET /api/deathcounter/v2/stream-online-sync`
- `GET /api/deathcounter/v2/sync/channelinfo`
- `GET /api/deathcounter/v2/tode`
- `POST /api/deathcounter/v2/command`
- `POST /api/deathcounter/v2/del`
- `POST /api/deathcounter/v2/game`
- `POST /api/deathcounter/v2/hide`
- `POST /api/deathcounter/v2/overlay/hide`
- `POST /api/deathcounter/v2/overlay/players`
- `POST /api/deathcounter/v2/overlay/replace`
- `POST /api/deathcounter/v2/overlay/show`
- `POST /api/deathcounter/v2/overlay/toggle`
- `POST /api/deathcounter/v2/players`
- `POST /api/deathcounter/v2/rip`
- `POST /api/deathcounter/v2/session-reset`
- `POST /api/deathcounter/v2/show`
- `POST /api/deathcounter/v2/total-reset`

## `backend/modules/diagnostics.js`

Version: `nicht erkannt`

- `ROUTE /api/diag/env`
- `ROUTE /api/diag/ping`
- `ROUTE /api/diag/ws`

## `backend/modules/discord.js`

Version: `nicht erkannt`

- `GET /api/discord/config`
- `GET /api/discord/routes`
- `GET /api/discord/settings`
- `GET /api/discord/sounds`
- `GET /api/discord/status`
- `GET/POST /api/discord/join`
- `GET/POST /api/discord/leave`
- `GET/POST /api/discord/queue/clear`
- `GET/POST /api/discord/queue/status`
- `POST /api/discord/integration-check`
- `POST /api/discord/play`
- `POST /api/discord/post/channel`
- `POST /api/discord/post/webhook`
- `ROUTE /api/discord/config`
- `ROUTE /api/discord/integration-check`
- `ROUTE /api/discord/join`
- `ROUTE /api/discord/leave`
- `ROUTE /api/discord/play`
- `ROUTE /api/discord/post/channel`
- `ROUTE /api/discord/post/message`
- `ROUTE /api/discord/post/webhook`
- `ROUTE /api/discord/queue/clear`
- `ROUTE /api/discord/queue/status`
- `ROUTE /api/discord/reload`
- `ROUTE /api/discord/routes`
- `ROUTE /api/discord/settings`
- `ROUTE /api/discord/sounds`
- `ROUTE /api/discord/status`

## `backend/modules/fireworks_api.js`

Version: `nicht erkannt`

- `GET /api/fireworks`
- `GET /api/fireworks/clear`
- `GET /api/fireworks/stop`

## `backend/modules/hug.js`

Version: `nicht erkannt`

- `GET /api/dashboard/community/hug/status`
- `GET /api/hug/cmd`
- `GET /api/hug/command`
- `GET /api/hug/config`
- `GET /api/hug/db/output-mode`
- `GET /api/hug/db/status`
- `GET /api/hug/reload`
- `GET /api/hug/routes`
- `GET /api/hug/settings`
- `GET /api/hug/stats`
- `GET /api/hug/statscmd`
- `GET /api/hug/status`
- `GET /api/hug/text-store/reload`
- `GET /api/hug/types`
- `GET/POST /api/dashboard/community/hug/hug-all-texts`
- `GET/POST /api/dashboard/community/hug/response-texts`
- `GET/POST /api/dashboard/community/hug/text-pairs`
- `GET/POST /api/hug/admin/hug-all-texts`
- `GET/POST /api/hug/admin/response-texts`
- `GET/POST /api/hug/admin/text-pairs`
- `GET/POST /api/hug/admin/top-title-texts`
- `GET/POST /api/hug/texts`
- `GET/POST /api/hug/top`
- `POST /api/hug/action`
- `POST /api/hug/db/output-mode`
- `POST /api/hug/integration-check`
- `POST /api/hug/reload`
- `POST /api/hug/text-store/status`
- `ROUTE /api/hug/action`
- `ROUTE /api/hug/admin/hug-all-texts`
- `ROUTE /api/hug/admin/response-texts`
- `ROUTE /api/hug/admin/text-pairs`
- `ROUTE /api/hug/admin/top-title-texts`
- `ROUTE /api/hug/cmd`
- `ROUTE /api/hug/command`
- `ROUTE /api/hug/config`
- `ROUTE /api/hug/db/output-mode`
- `ROUTE /api/hug/integration-check`
- `ROUTE /api/hug/reload`
- `ROUTE /api/hug/routes`
- `ROUTE /api/hug/settings`
- `ROUTE /api/hug/stats`
- `ROUTE /api/hug/statscmd`
- `ROUTE /api/hug/status`
- `ROUTE /api/hug/text-store/reload`
- `ROUTE /api/hug/text-store/status`
- `ROUTE /api/hug/texts`
- `ROUTE /api/hug/top`
- `ROUTE /api/hug/types`

## `backend/modules/hug_system.js`

Version: `nicht erkannt`

- `ROUTE /api/hug/action`
- `ROUTE /api/hug/cmd`
- `ROUTE /api/hug/reload`
- `ROUTE /api/hug/stats`
- `ROUTE /api/hug/statscmd`
- `ROUTE /api/hug/top`

## `backend/modules/kofi.js`

Version: `nicht erkannt`

- `ROUTE /api/alerts/kofi/config`
- `ROUTE /api/alerts/kofi/reload`
- `ROUTE /api/alerts/kofi/status`
- `ROUTE /api/alerts/kofi/test`
- `ROUTE /api/alerts/kofi/webhook`

## `backend/modules/loyalty.js`

Version: `0.1.11`

- `DELETE /api/loyalty/ignored-users/:login`
- `GET /api/loyalty/balance/:login`
- `GET /api/loyalty/config`
- `GET /api/loyalty/events`
- `GET /api/loyalty/events/test/:type`
- `GET /api/loyalty/ignored-users`
- `GET /api/loyalty/presence/run-once`
- `GET /api/loyalty/presence/status`
- `GET /api/loyalty/routes`
- `GET /api/loyalty/runner/events`
- `GET /api/loyalty/runner/run-once`
- `GET /api/loyalty/runner/start`
- `GET /api/loyalty/runner/status`
- `GET /api/loyalty/runner/stop`
- `GET /api/loyalty/settings`
- `GET /api/loyalty/status`
- `GET /api/loyalty/stream-state`
- `GET /api/loyalty/stream-state/clear-override`
- `GET /api/loyalty/stream-state/refresh-auto`
- `GET /api/loyalty/stream-state/start`
- `GET /api/loyalty/stream-state/stop`
- `GET /api/loyalty/test/watch`
- `GET /api/loyalty/transactions`
- `GET /api/loyalty/users`
- `GET /api/loyalty/users/:login`
- `GET /api/loyalty/watch/heartbeat`
- `GET /api/loyalty/watch/states`
- `POST /api/loyalty/events/ingest`
- `POST /api/loyalty/ignored-users`
- `POST /api/loyalty/presence/run-once`
- `POST /api/loyalty/runner/run-once`
- `POST /api/loyalty/runner/start`
- `POST /api/loyalty/runner/stop`
- `POST /api/loyalty/settings`
- `POST /api/loyalty/stream-state/clear-override`
- `POST /api/loyalty/stream-state/refresh-auto`
- `POST /api/loyalty/stream-state/start`
- `POST /api/loyalty/stream-state/stop`
- `POST /api/loyalty/transactions/adjust`
- `POST /api/loyalty/watch/heartbeat`

## `backend/modules/message_rotator.js`

Version: `nicht erkannt`

- `ROUTE /api/message-rotator/admin/settings`
- `ROUTE /api/message-rotator/admin/texts`
- `ROUTE /api/message-rotator/config`
- `ROUTE /api/message-rotator/integration-check`
- `ROUTE /api/message-rotator/live-status`
- `ROUTE /api/message-rotator/manual`
- `ROUTE /api/message-rotator/next`
- `ROUTE /api/message-rotator/reload`
- `ROUTE /api/message-rotator/routes`
- `ROUTE /api/message-rotator/settings`
- `ROUTE /api/message-rotator/start`
- `ROUTE /api/message-rotator/status`
- `ROUTE /api/message-rotator/stop`
- `ROUTE /api/message-rotator/tick`

## `backend/modules/message_rotator_scheduler.js`

Version: `nicht erkannt`

- `GET /api/message-rotator/scheduler/run`
- `GET /api/message-rotator/scheduler/settings`
- `GET/POST /api/message-rotator/scheduler/reload`
- `GET/POST /api/message-rotator/scheduler/start`
- `GET/POST /api/message-rotator/scheduler/status`
- `GET/POST /api/message-rotator/scheduler/stop`
- `POST /api/message-rotator/scheduler/settings`
- `ROUTE /api/message-rotator/scheduler/reload`
- `ROUTE /api/message-rotator/scheduler/routes`
- `ROUTE /api/message-rotator/scheduler/run`
- `ROUTE /api/message-rotator/scheduler/settings`
- `ROUTE /api/message-rotator/scheduler/start`
- `ROUTE /api/message-rotator/scheduler/status`
- `ROUTE /api/message-rotator/scheduler/stop`

## `backend/modules/messages.js`

Version: `nicht erkannt`

- `ROUTE /api/messages/config`
- `ROUTE /api/messages/integration-check`
- `ROUTE /api/messages/random`
- `ROUTE /api/messages/reload`
- `ROUTE /api/messages/routes`
- `ROUTE /api/messages/scheduler/start`
- `ROUTE /api/messages/scheduler/status`
- `ROUTE /api/messages/scheduler/stop`
- `ROUTE /api/messages/send`
- `ROUTE /api/messages/settings`
- `ROUTE /api/messages/status`

## `backend/modules/obs.js`

Version: `nicht erkannt`

- `GET /api/obs/audio/busy`
- `GET /api/obs/browser-sources`
- `GET /api/obs/config`
- `GET /api/obs/dashboard/config`
- `GET /api/obs/integration-check`
- `GET /api/obs/media/action`
- `GET /api/obs/replay/save`
- `GET /api/obs/routes`
- `GET /api/obs/scene/preview`
- `GET /api/obs/settings`
- `GET /api/obs/source/toggle`
- `GET /api/obs/sources`
- `GET /api/obs/stats`
- `GET /api/obs/status`
- `GET/POST /api/obs/reload`
- `POST /api/obs/audio/mute`
- `POST /api/obs/audio/state`
- `POST /api/obs/audio/toggle`
- `POST /api/obs/audio/unmute`
- `POST /api/obs/audio/volume`
- `POST /api/obs/filter/disable`
- `POST /api/obs/filter/enable`
- `POST /api/obs/filter/list`
- `POST /api/obs/integration-check`
- `POST /api/obs/reload`
- `POST /api/obs/replay/start`
- `POST /api/obs/replay/status`
- `POST /api/obs/replay/stop`
- `POST /api/obs/scene-items`
- `POST /api/obs/scene/switch`
- `POST /api/obs/scenes`
- `POST /api/obs/source/hide`
- `POST /api/obs/source/show`

## `backend/modules/overlay_data.js`

Version: `nicht erkannt`

- `GET /api/overlay/start-data`

## `backend/modules/scene_control.js`

Version: `1.2.1`

- `GET /api/scene/config`
- `GET /api/scene/health`
- `GET /api/scene/integration-check`
- `GET /api/scene/list`
- `GET /api/scene/reload`
- `GET /api/scene/routes`
- `GET /api/scene/set`
- `GET /api/scene/settings`
- `GET /api/scene/status`
- `POST /api/scene/integration-check`
- `POST /api/scene/reload`

## `backend/modules/security.js`

Version: `nicht erkannt`

- `ROUTE /api/security/status`

## `backend/modules/soundalerts_bridge.js`

Version: `0.1.14`

- `DELETE /api/soundalerts/entries/:entryKey`
- `GET /api/soundalerts/config`
- `GET /api/soundalerts/entries`
- `GET /api/soundalerts/events`
- `GET /api/soundalerts/integration-check`
- `GET /api/soundalerts/routes`
- `GET /api/soundalerts/settings`
- `GET /api/soundalerts/stats`
- `GET /api/soundalerts/status`
- `POST /api/soundalerts/config`
- `POST /api/soundalerts/entries/:entryKey/delete`
- `POST /api/soundalerts/entries/:entryKey/ignore`
- `POST /api/soundalerts/reload`
- `POST /api/soundalerts/settings`
- `POST /api/soundalerts/test/chat`
- `POST /api/soundalerts/upload`

## `backend/modules/start_overlay.js`

Version: `0.3.0`

- `ROUTE /api/overlay/start-chat`
- `ROUTE /api/overlay/start-chat/clear`
- `ROUTE /api/overlay/start/config`
- `ROUTE /api/overlay/start/reload`
- `ROUTE /api/overlay/start/status`

## `backend/modules/tipeee.js`

Version: `nicht erkannt`

- `ROUTE /api/alerts/tipeee/config`
- `ROUTE /api/alerts/tipeee/connect`
- `ROUTE /api/alerts/tipeee/disconnect`
- `ROUTE /api/alerts/tipeee/events/recent`
- `ROUTE /api/alerts/tipeee/reconnect`
- `ROUTE /api/alerts/tipeee/reload`
- `ROUTE /api/alerts/tipeee/status`
- `ROUTE /api/alerts/tipeee/test`
- `ROUTE /api/alerts/tipeee/webhook`

## `backend/modules/todo.js`

Version: `nicht erkannt`

- `ROUTE /api/todo/add`
- `ROUTE /api/todo/admin/settings`
- `ROUTE /api/todo/admin/texts`
- `ROUTE /api/todo/config`
- `ROUTE /api/todo/integration-check`
- `ROUTE /api/todo/reload`
- `ROUTE /api/todo/routes`
- `ROUTE /api/todo/settings`
- `ROUTE /api/todo/stats`
- `ROUTE /api/todo/stats/today`
- `ROUTE /api/todo/status`

## `backend/modules/tts_system.js`

Version: `nicht erkannt`

- `ALL /api/tts/clear`
- `ALL /api/tts/off`
- `ALL /api/tts/on`
- `ALL /api/tts/overlay-state`
- `ALL /api/tts/prepare-alert`
- `ALL /api/tts/reload`
- `ALL /api/tts/run`
- `ALL /api/tts/say`
- `ALL /api/tts/stats`
- `ALL /api/tts/stop`
- `GET /api/tts/admin/settings`
- `GET /api/tts/admin/texts`
- `GET /api/tts/command`
- `GET /api/tts/config`
- `GET /api/tts/done`
- `GET /api/tts/events`
- `GET /api/tts/integration-check`
- `GET /api/tts/overlay-state`
- `GET /api/tts/routes`
- `GET /api/tts/settings`
- `GET /api/tts/settings/upsert`
- `GET /api/tts/stats`
- `GET /api/tts/stats/users`
- `GET /api/tts/status`
- `GET /api/tts/synthesize`
- `GET /api/tts/voices`
- `POST /api/tts/admin/settings`
- `POST /api/tts/admin/texts`
- `POST /api/tts/settings`
- `POST /api/tts/settings/upsert`

## `backend/modules/twitch.js`

Version: `1`

- `GET /api/twitch/auth/validate`
- `GET /auth/bot/callback`
- `GET /auth/bot/login`
- `GET /auth/bot/logout`
- `GET /auth/bot/status`
- `GET /auth/callback`
- `GET /auth/login`
- `GET /auth/logout`
- `GET /auth/status`
- `GET /auth/validate`
- `GET /twitch/auth/validate`
- `GET /twitch/me`
- `ROUTE /api/twitch/alerts/audit/recent`
- `ROUTE /api/twitch/alerts/debug/eventsub`
- `ROUTE /api/twitch/alerts/debug/presets`
- `ROUTE /api/twitch/alerts/reload`
- `ROUTE /api/twitch/alerts/settings`
- `ROUTE /api/twitch/alerts/status`
- `ROUTE /api/twitch/alerts/test`
- `ROUTE /api/twitch/channel`
- `ROUTE /api/twitch/channel/summary`
- `ROUTE /api/twitch/chat/settings`
- `ROUTE /api/twitch/chatters`
- `ROUTE /api/twitch/cheermotes/reload`
- `ROUTE /api/twitch/cheermotes/status`
- `ROUTE /api/twitch/eventsub/cache`
- `ROUTE /api/twitch/eventsub/cache/all`
- `ROUTE /api/twitch/eventsub/cleanup-disconnected`
- `ROUTE /api/twitch/eventsub/reconcile`
- `ROUTE /api/twitch/eventsub/reconnect`
- `ROUTE /api/twitch/eventsub/status`
- `ROUTE /api/twitch/goals`
- `ROUTE /api/twitch/hypetrain`
- `ROUTE /api/twitch/hypetrain/raw`
- `ROUTE /api/twitch/polls`
- `ROUTE /api/twitch/predictions`
- `ROUTE /api/twitch/schedule`
- `ROUTE /api/twitch/stream`
- `ROUTE /api/twitch/stream/summary`
- `ROUTE /api/twitch/user`
- `ROUTE /api/twitch/user/by-id`
- `ROUTE /api/twitch/user/resolve`

## `backend/modules/twitch_chat_overlay.js`

Version: `0.5.0`

- `ROUTE /api/overlay/chat/clear`
- `ROUTE /api/overlay/chat/config`
- `ROUTE /api/overlay/chat/debug`
- `ROUTE /api/overlay/chat/emotes/lookup`
- `ROUTE /api/overlay/chat/emotes/reload`
- `ROUTE /api/overlay/chat/emotes/status`
- `ROUTE /api/overlay/chat/integration-check`
- `ROUTE /api/overlay/chat/reconnect`
- `ROUTE /api/overlay/chat/reload`
- `ROUTE /api/overlay/chat/routes`
- `ROUTE /api/overlay/chat/settings`
- `ROUTE /api/overlay/chat/start`
- `ROUTE /api/overlay/chat/status`
- `ROUTE /api/overlay/chat/stop`

## `backend/modules/twitch_presence.js`

Version: `nicht erkannt`

- `GET /api/twitch/presence/activity`
- `GET /api/twitch/presence/activity/clear`
- `GET /api/twitch/presence/config`
- `GET /api/twitch/presence/reload`
- `GET /api/twitch/presence/routes`
- `GET /api/twitch/presence/send`
- `GET /api/twitch/presence/settings`
- `GET /api/twitch/presence/start`
- `GET /api/twitch/presence/status`
- `GET/POST /api/twitch/presence/stop`
- `POST /api/twitch/presence/activity/active`
- `POST /api/twitch/presence/integration-check`
- `ROUTE /api/twitch/presence/activity`
- `ROUTE /api/twitch/presence/activity/active`
- `ROUTE /api/twitch/presence/activity/clear`
- `ROUTE /api/twitch/presence/activity/test`
- `ROUTE /api/twitch/presence/config`
- `ROUTE /api/twitch/presence/integration-check`
- `ROUTE /api/twitch/presence/reload`
- `ROUTE /api/twitch/presence/routes`
- `ROUTE /api/twitch/presence/send`
- `ROUTE /api/twitch/presence/settings`
- `ROUTE /api/twitch/presence/start`
- `ROUTE /api/twitch/presence/status`
- `ROUTE /api/twitch/presence/stop`
