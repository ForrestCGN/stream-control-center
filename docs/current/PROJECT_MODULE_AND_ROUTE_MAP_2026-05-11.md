# STEP256 Route-Ergaenzung

DeathCounter V2 neue Route:

```text
GET /api/deathcounter/v2/storage/consistency
```

Zweck: Read-only-Vergleich zwischen aktuellem JSON-State und importierten DeathCounter-DB-Zeilen. Kein Schreiben, kein Import, kein Storage-Wechsel.

---

# PROJECT MODULE AND ROUTE MAP

Stand: 2026-05-11  
Quelle: `stream-control-center_step234_source.zip`.

## Hinweis

Diese Route-Map wurde statisch aus den Backend-Dateien erzeugt. Sie ist eine Arbeitskarte, kein Ersatz fuer echte Live-API-Tests. Dynamisch registrierte Routen koennen nur als erkannte String-Routen auftauchen.

## Zusammenfassung nach Modul

|Modul|statisch erkannte Routen|erkannte Route-Strings|Beispiele|
|---|---|---|---|
|alert_system|51|40|/api/alerts/assets, /api/alerts/assets/:id, /api/alerts/assets/:id/usage, /api/alerts/assets/scan-durations, /api/alerts/assets/upload|
|challenge|0|16|/api/challenge, /api/challenge/config, /api/challenge/integration-check, /api/challenge/reload, /api/challenge/remove|
|chat_output|3|3|/api/chat-output/reload, /api/chat-output/send, /api/chat-output/status|
|clips|21|17|/api/clip/admin/settings, /api/clip/admin/settings, /api/clip/admin/texts, /api/clip/admin/texts, /api/clip/config|
|credits|2|2|/api/credits, /credits|
|dashboard_auth|8|9|/api/auth/audit, /api/auth/bootstrap-owner-local, /api/auth/logout, /api/auth/roles, /api/auth/session|
|dashboard_controlcenter|11|10|/api/dashboard/controlcenter/access, /api/dashboard/controlcenter/admin-configs, /api/dashboard/controlcenter/config/:id, /api/dashboard/controlcenter/config/:id, /api/dashboard/controlcenter/logging|
|database_core|0|2|/api/database/status, /api/system/database/status|
|deathcounter_v2|32|27|/api/deathcounter/v2/del, /api/deathcounter/v2/game, /api/deathcounter/v2/storage/preview, /api/deathcounter/v2/storage/validate, /api/deathcounter/v2/storage/import|
|diagnostics|6|3|/api/diag/env, /api/diag/ping, /api/diag/ws, /diag/env, /diag/ping|
|discord|33|27|/api/discord/config, /api/discord/integration-check, /api/discord/join, /api/discord/join, /api/discord/leave|
|fireworks_api|3|3|/api/fireworks, /api/fireworks/clear, /api/fireworks/stop|
|hug|0|32|/api/dashboard/community/hug/hug-all-texts, /api/dashboard/community/hug/response-texts, /api/dashboard/community/hug/status, /api/dashboard/community/hug/text-pairs, /api/dashboard/community/hug/text-store/status|
|kofi|5|5|/api/alerts/kofi/config, /api/alerts/kofi/reload, /api/alerts/kofi/status, /api/alerts/kofi/test, /api/alerts/kofi/webhook|
|loyalty|40|29|/api/loyalty/balance/:login, /api/loyalty/config, /api/loyalty/events, /api/loyalty/events/ingest, /api/loyalty/events/test/:type|
|message_rotator|46|30|/api/message-rotator/admin/settings, /api/message-rotator/admin/settings, /api/message-rotator/admin/texts, /api/message-rotator/admin/texts, /api/message-rotator/config|
|messages|32|26|/api/messages/config, /api/messages/integration-check, /api/messages/random, /api/messages/random, /api/messages/reload|
|obs|5|33|/api/obs/config, /api/obs/integration-check, /api/obs/reload, /api/obs/routes, /api/obs/settings|
|obs_shared|0|0||
|overlay_data|1|1|/api/overlay/start-data|
|scene_control|9|13|/api/scene/config, /api/scene/health, /api/scene/integration-check, /api/scene/list, /api/scene/reload|
|security|1|1|/api/security/status|
|sound_output_config|0|2|/api/sound, /overlays/sound_system_overlay.html|
|sound_system|0|2|/api/sound, /overlays/sound_system_overlay.html|
|soundalerts_bridge|16|15|/api/soundalerts/config, /api/soundalerts/config, /api/soundalerts/entries, /api/soundalerts/entries/:entryKey, /api/soundalerts/entries/:entryKey/delete|
|sqlite_core|0|0||
|start_overlay|8|5|/api/overlay/start-chat, /api/overlay/start-chat, /api/overlay/start-chat/clear, /api/overlay/start-chat/clear, /api/overlay/start/config|
|tagebuch|0|23|/api/tagebuch, /api/tagebuch/admin/settings, /api/tagebuch/admin/texts, /api/tagebuch/config, /api/tagebuch/entry|
|tipeee|9|9|/api/alerts/tipeee/config, /api/alerts/tipeee/connect, /api/alerts/tipeee/disconnect, /api/alerts/tipeee/events/recent, /api/alerts/tipeee/reconnect|
|todo|19|15|/api/todo/add, /api/todo/add, /api/todo/admin/settings, /api/todo/admin/settings, /api/todo/admin/texts|
|tts_system|15|24|/api/tts/admin/settings, /api/tts/admin/settings, /api/tts/admin/texts, /api/tts/admin/texts, /api/tts/config|
|twitch|87|86|/api/twitch/alerts/audit/recent, /api/twitch/alerts/debug/eventsub, /api/twitch/alerts/debug/presets, /api/twitch/alerts/reload, /api/twitch/alerts/settings|
|twitch_chat_overlay|33|28|/api/overlay/chat/clear, /api/overlay/chat/clear, /api/overlay/chat/config, /api/overlay/chat/debug, /api/overlay/chat/emotes/lookup|
|twitch_presence|19|19|/api/twitch/presence/activity, /api/twitch/presence/activity/active, /api/twitch/presence/activity/clear, /api/twitch/presence/activity/test, /api/twitch/presence/config|
|vip_sound_overlay|0|3|/api/vip, /api/vip-sound, /api/vip-sound-overlay|

# Detailroute-Map

## alert_system

- `? /api/alerts`
- `DELETE /api/alerts/assets/:id`
- `DELETE /api/alerts/chat-blocks/:id`
- `DELETE /api/alerts/display-profiles/:id`
- `DELETE /api/alerts/rules/:id`
- `DELETE /api/alerts/test-presets/:id`
- `DELETE /api/alerts/text-variants/:id`
- `GET /api/alerts/assets`
- `GET /api/alerts/assets/:id/usage`
- `GET /api/alerts/chat-blocks`
- `GET /api/alerts/chat-outbox`
- `GET /api/alerts/config`
- `GET /api/alerts/display-profiles`
- `GET /api/alerts/events`
- `GET /api/alerts/health`
- `GET /api/alerts/integration-check`
- `GET /api/alerts/queue`
- `GET /api/alerts/routes`
- `GET /api/alerts/rules`
- `GET /api/alerts/settings`
- `GET /api/alerts/status`
- `GET /api/alerts/test-presets`
- `GET /api/alerts/text-variants`
- `GET /api/alerts/twitch/bits`
- `GET /api/alerts/twitch/follow`
- `GET /api/alerts/twitch/raid`
- `POST /api/alerts/assets/scan-durations`
- `POST /api/alerts/assets/upload`
- `POST /api/alerts/chat-blocks`
- `POST /api/alerts/chat-outbox/:id/consumed`
- `POST /api/alerts/chat-outbox/:id/error`
- `POST /api/alerts/chat-outbox/:id/sent`
- `POST /api/alerts/clear`
- `POST /api/alerts/config`
- `POST /api/alerts/display-profiles`
- `POST /api/alerts/display-profiles/:id/play`
- `POST /api/alerts/enqueue`
- `POST /api/alerts/events/:eventUid/replay`
- `POST /api/alerts/reload`
- `POST /api/alerts/rules`
- `POST /api/alerts/rules/validate`
- `POST /api/alerts/settings`
- `POST /api/alerts/test`
- `POST /api/alerts/test-presets`
- `POST /api/alerts/test-presets/:id/play`
- `POST /api/alerts/text-variants`
- `POST /api/alerts/twitch`
- `PUT /api/alerts/chat-blocks/:id`
- `PUT /api/alerts/display-profiles/:id`
- `PUT /api/alerts/rules/:id`
- `PUT /api/alerts/test-presets/:id`
- `PUT /api/alerts/text-variants/:id`
## challenge

- `? /api/challenge`
- `? /api/challenge/config`
- `? /api/challenge/integration-check`
- `? /api/challenge/reload`
- `? /api/challenge/remove`
- `? /api/challenge/remove-next`
- `? /api/challenge/reset`
- `? /api/challenge/routes`
- `? /api/challenge/settings`
- `? /api/challenge/start`
- `? /api/challenge/stats`
- `? /api/challenge/stats/top`
- `? /api/challenge/stats/user`
- `? /api/challenge/status`
- `? /discord/play`
- `? /scripts/challenge`
## chat_output

- `GET /api/chat-output/status`
- `POST /api/chat-output/reload`
- `POST /api/chat-output/send`
## clips

- `? /api/clip`
- `? /api/clips`
- `GET /api/clip/admin/settings`
- `GET /api/clip/admin/texts`
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
- `GET /api/dashboard/clips/settings`
- `GET /api/dashboard/clips/texts`
- `POST /api/clip/admin/settings`
- `POST /api/clip/admin/texts`
- `POST /api/clip/create`
- `POST /api/clip/register`
- `POST /api/clip/reload`
- `POST /api/dashboard/clips/settings`
- `POST /api/dashboard/clips/texts`
## credits

- `GET /api/credits`
- `GET /credits`
## dashboard_auth

- `? /api/auth/twitch`
- `GET /api/auth/audit`
- `GET /api/auth/roles`
- `GET /api/auth/session`
- `GET /api/auth/status`
- `GET /api/auth/twitch/callback`
- `GET /api/auth/twitch/login`
- `POST /api/auth/bootstrap-owner-local`
- `POST /api/auth/logout`
## dashboard_controlcenter

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
## database_core

- `? /api/database/status`
- `? /api/system/database/status`
## deathcounter_v2

- `? /api/death-counter`
- `? /api/deathcounter`
- `? /api/deathcounter-v2`
- `? /api/deathcounter/v2`
- `? /api/deathcounter_v2`
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
- `GET /api/deathcounter/v2/storage/preview`
- `GET /api/deathcounter/v2/storage/validate`
- `POST /api/deathcounter/v2/storage/import`
- `GET /api/deathcounter/v2/stream-online-sync`
- `GET /api/deathcounter/v2/sync/channelinfo`
- `GET /api/deathcounter/v2/tode`
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
## diagnostics

- `GET /api/diag/env`
- `GET /api/diag/ping`
- `GET /api/diag/ws`
- `GET /diag/env`
- `GET /diag/ping`
- `GET /diag/ws`
## discord

- `? /api/discord`
- `? /discord`
- `GET /api/discord/config`
- `GET /api/discord/integration-check`
- `GET /api/discord/join`
- `GET /api/discord/leave`
- `GET /api/discord/play`
- `GET /api/discord/queue/clear`
- `GET /api/discord/queue/status`
- `GET /api/discord/routes`
- `GET /api/discord/settings`
- `GET /api/discord/sounds`
- `GET /api/discord/status`
- `GET /discord/join`
- `GET /discord/leave`
- `GET /discord/play`
- `GET /discord/queue/clear`
- `GET /discord/queue/status`
- `GET /discord/sounds`
- `GET /discord/status`
- `POST /api/discord/join`
- `POST /api/discord/leave`
- `POST /api/discord/play`
- `POST /api/discord/post/channel`
- `POST /api/discord/post/message`
- `POST /api/discord/post/webhook`
- `POST /api/discord/queue/clear`
- `POST /api/discord/reload`
- `POST /discord/join`
- `POST /discord/leave`
- `POST /discord/play`
- `POST /discord/post/channel`
- `POST /discord/post/message`
- `POST /discord/post/webhook`
- `POST /discord/queue/clear`
## fireworks_api

- `GET /api/fireworks`
- `GET /api/fireworks/clear`
- `GET /api/fireworks/stop`
## hug

- `? /api/dashboard/community/hug/hug-all-texts`
- `? /api/dashboard/community/hug/response-texts`
- `? /api/dashboard/community/hug/status`
- `? /api/dashboard/community/hug/text-pairs`
- `? /api/dashboard/community/hug/text-store/status`
- `? /api/dashboard/community/hug/top-title-texts`
- `? /api/hug`
- `? /api/hug-system`
- `? /api/hug/action`
- `? /api/hug/admin/hug-all-texts`
- `? /api/hug/admin/response-texts`
- `? /api/hug/admin/text-pairs`
- `? /api/hug/admin/top-title-texts`
- `? /api/hug/cmd`
- `? /api/hug/command`
- `? /api/hug/config`
- `? /api/hug/db/output-mode`
- `? /api/hug/db/status`
- `? /api/hug/integration-check`
- `? /api/hug/reload`
- `? /api/hug/routes`
- `? /api/hug/settings`
- `? /api/hug/stats`
- `? /api/hug/statscmd`
- `? /api/hug/status`
- `? /api/hug/text-store/reload`
- `? /api/hug/text-store/status`
- `? /api/hug/texts`
- `? /api/hug/top`
- `? /api/hug/types`
- `? /api/hugs`
- `? /api/rehug`
## kofi

- `GET /api/alerts/kofi/status`
- `GET /api/alerts/kofi/test`
- `POST /api/alerts/kofi/config`
- `POST /api/alerts/kofi/reload`
- `POST /api/alerts/kofi/webhook`
## loyalty

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
## message_rotator

- `? /api/message-rotator`
- `? /message-rotator`
- `GET /api/message-rotator/admin/settings`
- `GET /api/message-rotator/admin/texts`
- `GET /api/message-rotator/config`
- `GET /api/message-rotator/integration-check`
- `GET /api/message-rotator/live-status`
- `GET /api/message-rotator/manual`
- `GET /api/message-rotator/next`
- `GET /api/message-rotator/reload`
- `GET /api/message-rotator/routes`
- `GET /api/message-rotator/settings`
- `GET /api/message-rotator/start`
- `GET /api/message-rotator/status`
- `GET /api/message-rotator/stop`
- `GET /api/message-rotator/tick`
- `GET /message-rotator/admin/settings`
- `GET /message-rotator/admin/texts`
- `GET /message-rotator/config`
- `GET /message-rotator/integration-check`
- `GET /message-rotator/live-status`
- `GET /message-rotator/manual`
- `GET /message-rotator/next`
- `GET /message-rotator/reload`
- `GET /message-rotator/routes`
- `GET /message-rotator/settings`
- `GET /message-rotator/start`
- `GET /message-rotator/status`
- `GET /message-rotator/stop`
- `GET /message-rotator/tick`
- `POST /api/message-rotator/admin/settings`
- `POST /api/message-rotator/admin/texts`
- `POST /api/message-rotator/live-status`
- `POST /api/message-rotator/manual`
- `POST /api/message-rotator/next`
- `POST /api/message-rotator/reload`
- `POST /api/message-rotator/start`
- `POST /api/message-rotator/stop`
- `POST /api/message-rotator/tick`
- `POST /message-rotator/admin/settings`
- `POST /message-rotator/admin/texts`
- `POST /message-rotator/live-status`
- `POST /message-rotator/manual`
- `POST /message-rotator/next`
- `POST /message-rotator/reload`
- `POST /message-rotator/start`
- `POST /message-rotator/stop`
- `POST /message-rotator/tick`
## messages

- `? /api/messages`
- `? /messages`
- `GET /api/messages/config`
- `GET /api/messages/integration-check`
- `GET /api/messages/random`
- `GET /api/messages/reload`
- `GET /api/messages/render`
- `GET /api/messages/routes`
- `GET /api/messages/scheduler/status`
- `GET /api/messages/send`
- `GET /api/messages/settings`
- `GET /api/messages/status`
- `GET /messages/config`
- `GET /messages/integration-check`
- `GET /messages/random`
- `GET /messages/reload`
- `GET /messages/render`
- `GET /messages/routes`
- `GET /messages/scheduler/status`
- `GET /messages/send`
- `GET /messages/settings`
- `GET /messages/status`
- `POST /api/messages/random`
- `POST /api/messages/reload`
- `POST /api/messages/render`
- `POST /api/messages/scheduler/start`
- `POST /api/messages/scheduler/stop`
- `POST /api/messages/send`
- `POST /messages/random`
- `POST /messages/reload`
- `POST /messages/render`
- `POST /messages/scheduler/start`
- `POST /messages/scheduler/stop`
- `POST /messages/send`
## obs

- `? /api/obs`
- `? /api/obs/audio/busy`
- `? /api/obs/audio/mute`
- `? /api/obs/audio/state`
- `? /api/obs/audio/toggle`
- `? /api/obs/audio/unmute`
- `? /api/obs/audio/volume`
- `? /api/obs/browser-sources`
- `? /api/obs/dashboard/config`
- `? /api/obs/filter/disable`
- `? /api/obs/filter/enable`
- `? /api/obs/filter/list`
- `? /api/obs/filter/toggle`
- `? /api/obs/media/action`
- `? /api/obs/replay/save`
- `? /api/obs/replay/start`
- `? /api/obs/replay/status`
- `? /api/obs/replay/stop`
- `? /api/obs/scene-items`
- `? /api/obs/scene/preview`
- `? /api/obs/scene/switch`
- `? /api/obs/scenes`
- `? /api/obs/source/hide`
- `? /api/obs/source/show`
- `? /api/obs/source/toggle`
- `? /api/obs/sources`
- `? /api/obs/stats`
- `? /api/obs/status`
- `GET /api/obs/config`
- `GET /api/obs/integration-check`
- `GET /api/obs/routes`
- `GET /api/obs/settings`
- `POST /api/obs/reload`
## obs_shared

- `- keine Route statisch erkannt -`
## overlay_data

- `GET /api/overlay/start-data`
## scene_control

- `? /api/scene`
- `? /api/scene-control`
- `? /api/scene_control`
- `? /api/scenes`
- `GET /api/scene/config`
- `GET /api/scene/health`
- `GET /api/scene/integration-check`
- `GET /api/scene/list`
- `GET /api/scene/routes`
- `GET /api/scene/set`
- `GET /api/scene/settings`
- `GET /api/scene/status`
- `POST /api/scene/reload`
## security

- `GET /api/security/status`
## sound_output_config

- `? /api/sound`
- `? /overlays/sound_system_overlay.html`
## sound_system

- `? /api/sound`
- `? /overlays/sound_system_overlay.html`
## soundalerts_bridge

- `? /api/soundalerts`
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
## sqlite_core

- `- keine Route statisch erkannt -`
## start_overlay

- `GET /api/overlay/start-chat`
- `GET /api/overlay/start-chat/clear`
- `GET /api/overlay/start/config`
- `GET /api/overlay/start/reload`
- `GET /api/overlay/start/status`
- `POST /api/overlay/start-chat`
- `POST /api/overlay/start-chat/clear`
- `POST /api/overlay/start/reload`
## tagebuch

- `? /api/tagebuch`
- `? /api/tagebuch/admin/settings`
- `? /api/tagebuch/admin/texts`
- `? /api/tagebuch/config`
- `? /api/tagebuch/entry`
- `? /api/tagebuch/integration-check`
- `? /api/tagebuch/reload`
- `? /api/tagebuch/reset`
- `? /api/tagebuch/routes`
- `? /api/tagebuch/settings`
- `? /api/tagebuch/stats`
- `? /api/tagebuch/stats/today`
- `? /api/tagebuch/stats/top`
- `? /api/tagebuch/stats/user`
- `? /api/tagebuch/status`
- `? /api/tagebuch/stream/end`
- `? /api/tagebuch/stream/start`
- `? /discord/stream`
- `? /discord/stream/end`
- `? /discord/stream/start`
- `? /discord/tagebuch`
- `? /discord/tagebuch/reset`
- `? /discord/tagebuch/status`
## tipeee

- `GET /api/alerts/tipeee/events/recent`
- `GET /api/alerts/tipeee/status`
- `GET /api/alerts/tipeee/test`
- `POST /api/alerts/tipeee/config`
- `POST /api/alerts/tipeee/connect`
- `POST /api/alerts/tipeee/disconnect`
- `POST /api/alerts/tipeee/reconnect`
- `POST /api/alerts/tipeee/reload`
- `POST /api/alerts/tipeee/webhook`
## todo

- `? /api/todo`
- `GET /api/todo/add`
- `GET /api/todo/admin/settings`
- `GET /api/todo/admin/texts`
- `GET /api/todo/config`
- `GET /api/todo/integration-check`
- `GET /api/todo/reload`
- `GET /api/todo/routes`
- `GET /api/todo/settings`
- `GET /api/todo/stats`
- `GET /api/todo/stats/today`
- `GET /api/todo/stats/top`
- `GET /api/todo/status`
- `GET /discord/todo`
- `GET /discord/todo/status`
- `POST /api/todo/add`
- `POST /api/todo/admin/settings`
- `POST /api/todo/admin/texts`
- `POST /api/todo/reload`
- `POST /discord/todo`
## tts_system

- `? /api/tts/clear`
- `? /api/tts/command`
- `? /api/tts/done`
- `? /api/tts/off`
- `? /api/tts/on`
- `? /api/tts/prepare-alert`
- `? /api/tts/reload`
- `? /api/tts/run`
- `? /api/tts/say`
- `? /api/tts/stop`
- `? /api/tts/synthesize`
- `GET /api/tts/admin/settings`
- `GET /api/tts/admin/texts`
- `GET /api/tts/config`
- `GET /api/tts/events`
- `GET /api/tts/integration-check`
- `GET /api/tts/overlay-state`
- `GET /api/tts/routes`
- `GET /api/tts/settings`
- `GET /api/tts/stats`
- `GET /api/tts/stats/users`
- `GET /api/tts/status`
- `GET /api/tts/voices`
- `POST /api/tts/admin/settings`
- `POST /api/tts/admin/texts`
- `POST /api/tts/settings/upsert`
## twitch

- `? /api/twitch/badges`
- `? /api/twitch/clips`
- `? /api/twitch/emotes`
- `? /api/twitch/followers`
- `? /api/twitch/moderators`
- `? /api/twitch/raids`
- `? /api/twitch/rewards`
- `? /api/twitch/subscriptions`
- `? /api/twitch/videos`
- `? /api/twitch/vips`
- `? /twitch/badges`
- `? /twitch/clips`
- `? /twitch/emotes`
- `? /twitch/followers`
- `? /twitch/moderators`
- `? /twitch/raids`
- `? /twitch/rewards`
- `? /twitch/subscriptions`
- `? /twitch/videos`
- `? /twitch/vips`
- `GET /api/twitch/alerts/audit/recent`
- `GET /api/twitch/alerts/debug/presets`
- `GET /api/twitch/alerts/settings`
- `GET /api/twitch/alerts/status`
- `GET /api/twitch/alerts/test`
- `GET /api/twitch/auth/validate`
- `GET /api/twitch/channel`
- `GET /api/twitch/channel/summary`
- `GET /api/twitch/chat/settings`
- `GET /api/twitch/chatters`
- `GET /api/twitch/cheermotes/status`
- `GET /api/twitch/eventsub/cache`
- `GET /api/twitch/eventsub/cache/all`
- `GET /api/twitch/eventsub/cleanup-disconnected`
- `GET /api/twitch/eventsub/reconcile`
- `GET /api/twitch/eventsub/reconnect`
- `GET /api/twitch/eventsub/status`
- `GET /api/twitch/eventsub/subscriptions`
- `GET /api/twitch/goals`
- `GET /api/twitch/hypetrain`
- `GET /api/twitch/hypetrain/cache`
- `GET /api/twitch/hypetrain/cache/raw`
- `GET /api/twitch/hypetrain/raw`
- `GET /api/twitch/polls`
- `GET /api/twitch/predictions`
- `GET /api/twitch/schedule`
- `GET /api/twitch/stream`
- `GET /api/twitch/stream/summary`
- `GET /api/twitch/user`
- `GET /api/twitch/user/by-id`
- `GET /api/twitch/user/resolve`
- `GET /auth/bot/callback`
- `GET /auth/bot/login`
- `GET /auth/bot/logout`
- `GET /auth/bot/status`
- `GET /auth/callback`
- `GET /auth/login`
- `GET /auth/logout`
- `GET /auth/status`
- `GET /auth/validate`
- `GET /channelinfo`
- `GET /eventsub/cache`
- `GET /eventsub/cache_all`
- `GET /eventsub/cleanup-disconnected`
- `GET /eventsub/reconcile`
- `GET /eventsub/reconnect`
- `GET /eventsub/status`
- `GET /hypetrain/cache`
- `GET /hypetrain/cache_raw`
- `GET /streaminfo`
- `GET /twitch/alerts/audit/recent`
- `GET /twitch/alerts/debug/presets`
- `GET /twitch/alerts/settings`
- `GET /twitch/alerts/status`
- `GET /twitch/alerts/test`
- `GET /twitch/auth/validate`
- `GET /twitch/channel`
- `GET /twitch/channel-summary`
- `GET /twitch/chat-settings`
- `GET /twitch/chatters`
- `GET /twitch/cheermotes/status`
- `GET /twitch/eventsub/cleanup-disconnected`
- `GET /twitch/eventsub/reconcile`
- `GET /twitch/eventsub/reconnect`
- `GET /twitch/eventsub/status`
- `GET /twitch/eventsub/subscriptions`
- `GET /twitch/goals`
- `GET /twitch/hypetrain`
- `GET /twitch/hypetrain/raw`
- `GET /twitch/me`
- `GET /twitch/polls`
- `GET /twitch/predictions`
- `GET /twitch/resolve-user`
- `GET /twitch/schedule`
- `GET /twitch/stream`
- `GET /twitch/stream-summary`
- `GET /twitch/user`
- `GET /twitch/user-by-id`
- `GET /userinfo`
- `POST /api/twitch/alerts/debug/eventsub`
- `POST /api/twitch/alerts/reload`
- `POST /api/twitch/alerts/settings`
- `POST /api/twitch/cheermotes/reload`
- `POST /twitch/alerts/debug/eventsub`
- `POST /twitch/alerts/reload`
- `POST /twitch/alerts/settings`
- `POST /twitch/cheermotes/reload`
## twitch_chat_overlay

- `? /api/chat-overlay`
- `? /api/overlay/chat`
- `? /api/overlay/start-chat`
- `? /api/overlay/start-chat/irc`
- `? /api/twitch-chat-overlay`
- `GET /api/overlay/chat/clear`
- `GET /api/overlay/chat/config`
- `GET /api/overlay/chat/debug`
- `GET /api/overlay/chat/emotes/lookup`
- `GET /api/overlay/chat/emotes/reload`
- `GET /api/overlay/chat/emotes/status`
- `GET /api/overlay/chat/integration-check`
- `GET /api/overlay/chat/reconnect`
- `GET /api/overlay/chat/routes`
- `GET /api/overlay/chat/settings`
- `GET /api/overlay/chat/start`
- `GET /api/overlay/chat/status`
- `GET /api/overlay/chat/stop`
- `GET /api/overlay/start-chat/clear-live`
- `GET /api/overlay/start-chat/debug`
- `GET /api/overlay/start-chat/emotes/lookup`
- `GET /api/overlay/start-chat/emotes/reload`
- `GET /api/overlay/start-chat/emotes/status`
- `GET /api/overlay/start-chat/irc/reconnect`
- `GET /api/overlay/start-chat/irc/start`
- `GET /api/overlay/start-chat/irc/status`
- `GET /api/overlay/start-chat/irc/stop`
- `POST /api/overlay/chat/clear`
- `POST /api/overlay/chat/emotes/reload`
- `POST /api/overlay/chat/reconnect`
- `POST /api/overlay/chat/reload`
- `POST /api/overlay/chat/start`
- `POST /api/overlay/chat/stop`
- `POST /api/overlay/start-chat/clear-live`
- `POST /api/overlay/start-chat/emotes/reload`
- `POST /api/overlay/start-chat/irc/reconnect`
- `POST /api/overlay/start-chat/irc/start`
- `POST /api/overlay/start-chat/irc/stop`
## twitch_presence

- `? /api/twitch/presence`
- `? /twitch/presence`
- `GET /api/twitch/presence/activity`
- `GET /api/twitch/presence/activity/active`
- `GET /api/twitch/presence/activity/test`
- `GET /api/twitch/presence/config`
- `GET /api/twitch/presence/integration-check`
- `GET /api/twitch/presence/routes`
- `GET /api/twitch/presence/send`
- `GET /api/twitch/presence/settings`
- `GET /api/twitch/presence/start`
- `GET /api/twitch/presence/status`
- `GET /api/twitch/presence/stop`
- `GET /twitch/presence/send`
- `GET /twitch/presence/start`
- `GET /twitch/presence/status`
- `GET /twitch/presence/stop`
- `POST /api/twitch/presence/activity/clear`
- `POST /api/twitch/presence/reload`
- `POST /api/twitch/presence/send`
- `POST /twitch/presence/send`
## vip_sound_overlay

- `? /api/vip`
- `? /api/vip-sound`
- `? /api/vip-sound-overlay`

## STEP252 DeathCounter Integration-Check-Erweiterung

Route bleibt:

```text
GET /api/deathcounter/v2/integration-check
```

Neu im Check:

```text
database_storage_schema
```

Der Check meldet:

```text
- schemaModule: deathcounter_v2_storage
- schemaVersion / targetVersion
- activeStorage: json_state_file
- preparedStorage: database_schema
- migrationPerformed: false
- countsImported: false
- Tabellenstatus für deathcounter_players, deathcounter_games, deathcounter_counts, deathcounter_overlay_state, deathcounter_events
```


## STEP253 DeathCounter Storage-Preview

Neue Route:

```text
GET /api/deathcounter/v2/storage/preview
```

Optionale Query-Parameter:

```text
limit
includeRows
```

Integration-Check meldet jetzt zusaetzlich:

```text
database_storage_preview
```

Der Preview-Endpunkt ist read-only und fuehrt keinen Import, kein INSERT/UPDATE/DELETE und keine Storage-Umschaltung aus.
