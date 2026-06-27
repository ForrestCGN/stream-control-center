# MODULE_DOCS_CONSOLIDATED_CURRENT

Stand: 2026-06-27  
Step: `RDAP_DOCS_CLEANUP_4_MODULE_DOCS_CONSOLIDATION`  
Branch/Truth: `GitHub/dev` + lokales Repo `D:\Git\stream-control-center`.

## Zweck

Diese Datei verdichtet die bisherige Modul-Inventur in eine lesbare zentrale Modul-Doku. Sie ersetzt keine Codepruefung und aktiviert keine Funktion. Sie ist die Arbeitsgrundlage, um alte Einzel-Dokus spaeter zusammenzufuehren oder zu loeschen.

## Sicherheitsgrenze

- Keine Codeaenderung.
- Keine produktive Loeschung.
- Keine DB-Aenderung.
- Kein Webserver-Deploy.
- Keine OBS-/Streamer.bot-/Remote-Writes.

## Zaehnung aus den gelieferten Snapshots

| Bereich | Anzahl |
| --- | --- |
| Backend JS-Module | 84 |
| Dashboard JS-Module | 47 |
| Dashboard CSS-Module | 49 |
| Dashboard Components | 5 |
| Remote Routes | 11 |
| Remote Services | 33 |
| Stream-PC-Agent Dateien | 5 |
| docs/current Snapshot-Dateien | 1466 |
| project-state Root Snapshot-Dateien | 249 |

## Zentrale Modul-Domaenen

Die alte Doku ist zu stark nach Steps/CAN/RDAP-Handoffs zersplittert. Fuer die weitere Pflege gelten diese Domaenen als Zielstruktur:

| Domaene | Backend-Dateien | Beispiele |
| --- | --- | --- |
| Commands/Shoutout/Clips | 4 | clip_shoutout, clips, commands, hug |
| Content/Tools | 8 | deathcounter_v2, kofi, message_rotator, message_rotator_scheduler, messages, tagebuch, tipeee, todo |
| Core/Security/DB/Helpers | 24 | audit_log, bus_diagnostics, bus_integration_matrix, communication_bus, dashboard_auth, database_core, diagnostics, helper_audit_log ... |
| Loyalty/Games/Giveaway | 7 | loyalty, loyalty_games, gamble, presets, shared, wheel, loyalty_giveaways |
| Media/Sound/Video | 11 | commands_media, discord, helper_media, media, sound_loudness_scanner, sound_media_bridge, sound_output_config, sound_system ... |
| OBS/Streaming-PC Status | 5 | live_status_monitor, obs, obs_shared, scene_control, stream_status |
| Overlay/Alerts/Visuals | 11 | alert_system, birthday, challenge, credits, fireworks_api, hypetrain, overlay_data, overlay_monitor ... |
| Remote/RDAP | 1 | remote_agent |
| Twitch/EventSub/Chat | 11 | channelpoints, channelpoints_eventsub_bus_bridge, channelpoints_twitch_readonly_sync, chat_output, helper_chat_output, helper_twitch_roles, stream_events, twitch ... |
| Unklar / manuell pruefen | 2 | dashboard_controlcenter, shot_alarm |

## Backend-Module nach Domaene


### Commands/Shoutout/Clips

| Pfad | Status |
| --- | --- |
| backend/modules/clip_shoutout.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/clips.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/commands.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/hug.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |

### Content/Tools

| Pfad | Status |
| --- | --- |
| backend/modules/deathcounter_v2.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/kofi.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/message_rotator.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/message_rotator_scheduler.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/messages.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/tagebuch.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/tipeee.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/todo.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |

### Core/Security/DB/Helpers

| Pfad | Status |
| --- | --- |
| backend/modules/audit_log.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/bus_diagnostics.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/bus_integration_matrix.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/communication_bus.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/dashboard_auth.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/database_core.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/diagnostics.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_audit_log.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_communication.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_config.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_cooldown.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_core.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_dashboard_audit.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_dashboard_auth.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_messages.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_queue.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_routes.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_security.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_security_context.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_settings.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_state.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_texts.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/security.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/sqlite_core.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |

### Loyalty/Games/Giveaway

| Pfad | Status |
| --- | --- |
| backend/modules/loyalty.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/loyalty_games.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/loyalty_games/gamble.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/loyalty_games/presets.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/loyalty_games/shared.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/loyalty_games/wheel.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/loyalty_giveaways.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |

### Media/Sound/Video

| Pfad | Status |
| --- | --- |
| backend/modules/commands_media.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/discord.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_media.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/media.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/sound_loudness_scanner.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/sound_media_bridge.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/sound_output_config.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/sound_system.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/tts_system.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/video_media_bridge.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/vip-sound.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |

### OBS/Streaming-PC Status

| Pfad | Status |
| --- | --- |
| backend/modules/live_status_monitor.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/obs.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/obs_shared.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/scene_control.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/stream_status.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |

### Overlay/Alerts/Visuals

| Pfad | Status |
| --- | --- |
| backend/modules/alert_system.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/birthday.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/challenge.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/credits.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/fireworks_api.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/hypetrain.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/overlay_data.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/overlay_monitor.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/soundalerts_bridge.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/start_overlay.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/vip30.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |

### Remote/RDAP

| Pfad | Status |
| --- | --- |
| backend/modules/remote_agent.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |

### Twitch/EventSub/Chat

| Pfad | Status |
| --- | --- |
| backend/modules/channelpoints.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/channelpoints_eventsub_bus_bridge.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/channelpoints_twitch_readonly_sync.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/chat_output.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_chat_output.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/helpers/helper_twitch_roles.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/stream_events.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/twitch.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/twitch_chat_overlay.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/twitch_events.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/twitch_presence.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |

### Unklar / manuell pruefen

| Pfad | Status |
| --- | --- |
| backend/modules/dashboard_controlcenter.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |
| backend/modules/shot_alarm.js | vorhanden im Snapshot; gegen lokales dev bei Bedarf erneut pruefen |

## Dashboard-Module nach Domaene


### Commands/Shoutout/Clips

| Pfad | Status |
| --- | --- |
| htdocs/dashboard/modules/auto_shoutout.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/clip_shoutout.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/clips.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/commands.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/commands_readonly_diagnostics.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/hug.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/hug_diagnostics_ext.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/shoutout.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/shoutout_texts.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/shoutout_v2.js | Dashboard-Modul; gegen lokales dev pruefen |

### Content/Tools

| Pfad | Status |
| --- | --- |
| htdocs/dashboard/modules/deathcounter.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/message_rotator.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/tagebuch.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/todo.js | Dashboard-Modul; gegen lokales dev pruefen |

### Core/Security/DB/Helpers

| Pfad | Status |
| --- | --- |
| htdocs/dashboard/modules/adminconfigs.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/bus_diagnostics.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/diagnostics.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/message_rotator_diagnostics_ext.js | Dashboard-Modul; gegen lokales dev pruefen |

### Loyalty/Games/Giveaway

| Pfad | Status |
| --- | --- |
| htdocs/dashboard/modules/loyalty.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/loyalty_games.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/loyalty_giveaways.js | Dashboard-Modul; gegen lokales dev pruefen |

### Media/Sound/Video

| Pfad | Status |
| --- | --- |
| htdocs/dashboard/modules/commands_media.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/media.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/sound.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/sound_levelscan.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/tts.js | Dashboard-Modul; gegen lokales dev pruefen |

### OBS/Streaming-PC Status

| Pfad | Status |
| --- | --- |
| htdocs/dashboard/modules/live_status_monitor.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/obs.js | Dashboard-Modul; gegen lokales dev pruefen |

### Overlay/Alerts/Visuals

| Pfad | Status |
| --- | --- |
| htdocs/dashboard/modules/alerts.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/birthday.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/hypetrain.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/overlay_monitor_safety_ext.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/overlays.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/shoutout_overlay_sets.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/soundalerts.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/vip30.js | Dashboard-Modul; gegen lokales dev pruefen |

### Twitch/EventSub/Chat

| Pfad | Status |
| --- | --- |
| htdocs/dashboard/modules/channelpoints.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/channelpoints_readonly_sync_tab.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/stream_events.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/twitch_events.js | Dashboard-Modul; gegen lokales dev pruefen |

### Unklar / manuell pruefen

| Pfad | Status |
| --- | --- |
| htdocs/dashboard/modules/controlhome.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/sectionhome.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/shot_alarm.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/streamdesk.js | Dashboard-Modul; gegen lokales dev pruefen |
| htdocs/dashboard/modules/vip.js | Dashboard-Modul; gegen lokales dev pruefen |

## Konsolidierungsregel ab jetzt

Neue Feature-Doku nicht mehr als beliebige Einzeldatei in `docs/current/` ablegen, wenn eine zentrale Domaenen-Doku reicht. Ausnahme: echte Handoff-/Next-Chat-Dateien fuer den direkten naechsten Step.

Ziel fuer weitere Cleanup-Steps:

```text
Domaenen-Doku behalten/erweitern.
Alte Step-Handoffs nach Auswertung archivieren oder loeschen.
project-state Root bleibt schlank.
```
