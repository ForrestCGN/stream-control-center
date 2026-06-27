# Module Inventory Current

Stand: 2026-06-27  
Step: `RDAP_DOCS_CLEANUP_1_DEV_MODULE_STATS_INVENTORY`  
Basis: hochgeladene Snapshots aus lokalem Projekt-/Live-Kontext plus GitHub/dev-Arbeitsvorgabe.  
Zweck: zentrale Modulübersicht für den nächsten echten Docs-/Stats-Cleanup.

## Wichtig

Diese Datei ist Inventar und Gegenprüfungsgrundlage, keine Funktionsfreigabe.

- GitHub/default branch ist `dev`.
- Lokales Repo bleibt `D:\Git\stream-control-center`.
- Live-/Snapshot-Dateien sind Prüfmaterial, nicht automatisch Wahrheit.
- Keine Funktionalität wurde in diesem Step entfernt.
- In Step 1 werden keine Runtime-Dateien gelöscht.

## Zählung aus den gelieferten Snapshots

| Bereich | Anzahl |
|---|---:|
| `backend/modules/*.js` aktiv wirkend | 84 |
| davon Top-Level Backend-Module | 62 |
| davon Unterordner-/Helper-Module | 22 |
| `htdocs/dashboard/modules/*.js` | 47 |
| `htdocs/dashboard/modules/*.css` | 49 |
| Dashboard-Komponenten | 5 |
| Overlay-/htdocs UI-Dateien | 47 |
| Remote-Modboard Routes | 11 |
| Remote-Modboard Services | 33 |
| Stream-PC-Agent Dateien | 5 |

## Backend Module

| Pfad | wahrscheinliche Verantwortung | Status |
| --- | --- | --- |
| backend/modules/alert_system.js | Alerts/Overlay/Benachrichtigungen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/audit_log.js | Audit/Logging/Nachvollziehbarkeit | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/birthday.js | Birthday Feature | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/bus_diagnostics.js | EventBus/Diagnose/Integration | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/bus_integration_matrix.js | EventBus/Diagnose/Integration | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/challenge.js | Challenge-System | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/channelpoints.js | Twitch Kanalpunkte | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/channelpoints_eventsub_bus_bridge.js | EventBus/Diagnose/Integration | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/channelpoints_twitch_readonly_sync.js | Twitch Kanalpunkte | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/chat_output.js | Chat-Ausgabe/Chat-Integration | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/clip_shoutout.js | Clip/Shoutout | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/clips.js | Clip/Shoutout | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/commands.js | Command-System | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/commands_media.js | Command-System | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/communication_bus.js | EventBus/Diagnose/Integration | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/credits.js | Credits/Endscreen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/dashboard_auth.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/dashboard_controlcenter.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/database_core.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/deathcounter_v2.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/diagnostics.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/discord.js | Discord/Sound/Voice-Integration | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/fireworks_api.js | Fireworks Overlay/API | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/hug.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/hypetrain.js | Hype Train | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/kofi.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/live_status_monitor.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/loyalty.js | Loyalty/Punkte/Spiele | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/loyalty_games.js | Loyalty/Punkte/Spiele | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/loyalty_giveaways.js | Giveaway | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/media.js | Media/Sounds/Picker | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/message_rotator.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/message_rotator_scheduler.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/messages.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/obs.js | OBS/Status/Steuerungsnähe | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/obs_shared.js | OBS/Status/Steuerungsnähe | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/overlay_data.js | Overlay-System | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/overlay_monitor.js | Overlay-System | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/remote_agent.js | Remote-Agent/RDAP | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/scene_control.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/security.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/shot_alarm.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/sound_loudness_scanner.js | Sound/Media | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/sound_media_bridge.js | Media/Sounds/Picker | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/sound_output_config.js | Konfiguration | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/sound_system.js | Sound/Media | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/soundalerts_bridge.js | Alerts/Overlay/Benachrichtigungen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/sqlite_core.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/start_overlay.js | Overlay-System | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/stream_events.js | Stream-/Twitch-Events | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/stream_status.js | Stream Status/Event | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/tagebuch.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/tipeee.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/todo.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/tts_system.js | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/twitch.js | Twitch API/EventSub | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/twitch_chat_overlay.js | Chat-Ausgabe/Chat-Integration | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/twitch_events.js | Stream-/Twitch-Events | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/twitch_presence.js | Twitch API/EventSub | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/video_media_bridge.js | Media/Sounds/Picker | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/vip-sound.js | Sound/Media | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/vip30.js | VIP30/VIP-Feature | aktiv laut Snapshot, gegen lokales dev prüfen |
| backend/modules/helpers/helper_audit_log.js | Audit/Logging/Nachvollziehbarkeit | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_chat_output.js | Chat-Ausgabe/Chat-Integration | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_communication.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_config.js | Konfiguration | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_cooldown.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_core.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_dashboard_audit.js | Audit/Logging/Nachvollziehbarkeit | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_dashboard_auth.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_media.js | Media/Sounds/Picker | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_messages.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_queue.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_routes.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_security.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_security_context.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_settings.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_state.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_texts.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/helpers/helper_twitch_roles.js | Twitch API/EventSub | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/loyalty_games/gamble.js | Loyalty Games/Gamble | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/loyalty_games/presets.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/loyalty_games/shared.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |
| backend/modules/loyalty_games/wheel.js | Prüfen / fachlich einordnen | Untermodul/Helper, gegen lokales dev prüfen |

## Dashboard Module

| Modul | JS | CSS | wahrscheinliche Verantwortung | Status |
| --- | --- | --- | --- | --- |
| adminconfigs | htdocs/dashboard/modules/adminconfigs.js | htdocs/dashboard/modules/adminconfigs.css | Konfiguration | aktiv laut Snapshot, gegen lokales dev prüfen |
| alerts | htdocs/dashboard/modules/alerts.js | htdocs/dashboard/modules/alerts.css | Alerts/Overlay/Benachrichtigungen | aktiv laut Snapshot, gegen lokales dev prüfen |
| auto_shoutout | htdocs/dashboard/modules/auto_shoutout.js | htdocs/dashboard/modules/auto_shoutout.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| birthday | htdocs/dashboard/modules/birthday.js | htdocs/dashboard/modules/birthday.css | Birthday Feature | aktiv laut Snapshot, gegen lokales dev prüfen |
| bus_diagnostics | htdocs/dashboard/modules/bus_diagnostics.js | htdocs/dashboard/modules/bus_diagnostics.css | EventBus/Diagnose/Integration | aktiv laut Snapshot, gegen lokales dev prüfen |
| bus_diagnostics_readonly_summary | htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js | htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css | EventBus/Diagnose/Integration | aktiv laut Snapshot, gegen lokales dev prüfen |
| bus_diagnostics_subpage_safety_ext | htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.js | htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.css | EventBus/Diagnose/Integration | aktiv laut Snapshot, gegen lokales dev prüfen |
| channelpoints | htdocs/dashboard/modules/channelpoints.js | htdocs/dashboard/modules/channelpoints.css | Twitch Kanalpunkte | aktiv laut Snapshot, gegen lokales dev prüfen |
| channelpoints_readonly_sync_tab | htdocs/dashboard/modules/channelpoints_readonly_sync_tab.js | htdocs/dashboard/modules/channelpoints_readonly_sync_tab.css | Twitch Kanalpunkte | aktiv laut Snapshot, gegen lokales dev prüfen |
| clip_shoutout | htdocs/dashboard/modules/clip_shoutout.js | htdocs/dashboard/modules/clip_shoutout.css | Clip/Shoutout | aktiv laut Snapshot, gegen lokales dev prüfen |
| clips | htdocs/dashboard/modules/clips.js | htdocs/dashboard/modules/clips.css | Clip/Shoutout | aktiv laut Snapshot, gegen lokales dev prüfen |
| commands | htdocs/dashboard/modules/commands.js | htdocs/dashboard/modules/commands.css | Command-System | aktiv laut Snapshot, gegen lokales dev prüfen |
| commands_media | htdocs/dashboard/modules/commands_media.js | htdocs/dashboard/modules/commands_media.css | Command-System | aktiv laut Snapshot, gegen lokales dev prüfen |
| commands_readonly_diagnostics | htdocs/dashboard/modules/commands_readonly_diagnostics.js | htdocs/dashboard/modules/commands_readonly_diagnostics.css | Command-System | aktiv laut Snapshot, gegen lokales dev prüfen |
| controlhome | htdocs/dashboard/modules/controlhome.js | htdocs/dashboard/modules/controlhome.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| deathcounter | htdocs/dashboard/modules/deathcounter.js | htdocs/dashboard/modules/deathcounter.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| diagnostics | htdocs/dashboard/modules/diagnostics.js | htdocs/dashboard/modules/diagnostics.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| hug | htdocs/dashboard/modules/hug.js | htdocs/dashboard/modules/hug.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| hug_diagnostics_ext | htdocs/dashboard/modules/hug_diagnostics_ext.js | htdocs/dashboard/modules/hug_diagnostics_ext.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| hypetrain | htdocs/dashboard/modules/hypetrain.js | htdocs/dashboard/modules/hypetrain.css | Hype Train | aktiv laut Snapshot, gegen lokales dev prüfen |
| live_status_monitor | htdocs/dashboard/modules/live_status_monitor.js | htdocs/dashboard/modules/live_status_monitor.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| loyalty | htdocs/dashboard/modules/loyalty.js | htdocs/dashboard/modules/loyalty.css | Loyalty/Punkte/Spiele | aktiv laut Snapshot, gegen lokales dev prüfen |
| loyalty_games | htdocs/dashboard/modules/loyalty_games.js | htdocs/dashboard/modules/loyalty_games.css | Loyalty/Punkte/Spiele | aktiv laut Snapshot, gegen lokales dev prüfen |
| loyalty_giveaways | htdocs/dashboard/modules/loyalty_giveaways.js | htdocs/dashboard/modules/loyalty_giveaways.css | Giveaway | aktiv laut Snapshot, gegen lokales dev prüfen |
| loyalty_giveaways_cleanup | - | htdocs/dashboard/modules/loyalty_giveaways_cleanup.css | Giveaway | aktiv laut Snapshot, gegen lokales dev prüfen |
| loyalty_giveaways_wheel_editor_cleanup | - | htdocs/dashboard/modules/loyalty_giveaways_wheel_editor_cleanup.css | Giveaway | aktiv laut Snapshot, gegen lokales dev prüfen |
| media | htdocs/dashboard/modules/media.js | htdocs/dashboard/modules/media.css | Media/Sounds/Picker | aktiv laut Snapshot, gegen lokales dev prüfen |
| message_rotator | htdocs/dashboard/modules/message_rotator.js | htdocs/dashboard/modules/message_rotator.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| message_rotator_diagnostics_ext | htdocs/dashboard/modules/message_rotator_diagnostics_ext.js | htdocs/dashboard/modules/message_rotator_diagnostics_ext.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| obs | htdocs/dashboard/modules/obs.js | htdocs/dashboard/modules/obs.css | OBS/Status/Steuerungsnähe | aktiv laut Snapshot, gegen lokales dev prüfen |
| overlay_monitor_safety_ext | htdocs/dashboard/modules/overlay_monitor_safety_ext.js | htdocs/dashboard/modules/overlay_monitor_safety_ext.css | Overlay-System | aktiv laut Snapshot, gegen lokales dev prüfen |
| overlays | htdocs/dashboard/modules/overlays.js | htdocs/dashboard/modules/overlays.css | Overlay-System | aktiv laut Snapshot, gegen lokales dev prüfen |
| sectionhome | htdocs/dashboard/modules/sectionhome.js | htdocs/dashboard/modules/sectionhome.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| shot_alarm | htdocs/dashboard/modules/shot_alarm.js | htdocs/dashboard/modules/shot_alarm.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| shoutout | htdocs/dashboard/modules/shoutout.js | htdocs/dashboard/modules/shoutout.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| shoutout_overlay_sets | htdocs/dashboard/modules/shoutout_overlay_sets.js | htdocs/dashboard/modules/shoutout_overlay_sets.css | Overlay-System | aktiv laut Snapshot, gegen lokales dev prüfen |
| shoutout_texts | htdocs/dashboard/modules/shoutout_texts.js | htdocs/dashboard/modules/shoutout_texts.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| shoutout_v2 | htdocs/dashboard/modules/shoutout_v2.js | htdocs/dashboard/modules/shoutout_v2.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| sound | htdocs/dashboard/modules/sound.js | htdocs/dashboard/modules/sound.css | Sound/Media | aktiv laut Snapshot, gegen lokales dev prüfen |
| sound_levelscan | htdocs/dashboard/modules/sound_levelscan.js | htdocs/dashboard/modules/sound_levelscan.css | Sound/Media | aktiv laut Snapshot, gegen lokales dev prüfen |
| soundalerts | htdocs/dashboard/modules/soundalerts.js | htdocs/dashboard/modules/soundalerts.css | Alerts/Overlay/Benachrichtigungen | aktiv laut Snapshot, gegen lokales dev prüfen |
| stream_events | htdocs/dashboard/modules/stream_events.js | htdocs/dashboard/modules/stream_events.css | Stream-/Twitch-Events | aktiv laut Snapshot, gegen lokales dev prüfen |
| streamdesk | htdocs/dashboard/modules/streamdesk.js | htdocs/dashboard/modules/streamdesk.css | Stream Status/Event | aktiv laut Snapshot, gegen lokales dev prüfen |
| tagebuch | htdocs/dashboard/modules/tagebuch.js | htdocs/dashboard/modules/tagebuch.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| todo | htdocs/dashboard/modules/todo.js | htdocs/dashboard/modules/todo.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| tts | htdocs/dashboard/modules/tts.js | htdocs/dashboard/modules/tts.css | Prüfen / fachlich einordnen | aktiv laut Snapshot, gegen lokales dev prüfen |
| twitch_events | htdocs/dashboard/modules/twitch_events.js | htdocs/dashboard/modules/twitch_events.css | Stream-/Twitch-Events | aktiv laut Snapshot, gegen lokales dev prüfen |
| vip | htdocs/dashboard/modules/vip.js | htdocs/dashboard/modules/vip.css | VIP30/VIP-Feature | aktiv laut Snapshot, gegen lokales dev prüfen |
| vip30 | htdocs/dashboard/modules/vip30.js | htdocs/dashboard/modules/vip30.css | VIP30/VIP-Feature | aktiv laut Snapshot, gegen lokales dev prüfen |

## Dashboard Komponenten

| Pfad | wahrscheinliche Verantwortung | Status |
| --- | --- | --- |
| htdocs/dashboard/components/media_field.css | Media/Sounds/Picker | Dashboard-Komponente |
| htdocs/dashboard/components/media_field.js | Media/Sounds/Picker | Dashboard-Komponente |
| htdocs/dashboard/components/media_picker.css | Media/Sounds/Picker | Dashboard-Komponente |
| htdocs/dashboard/components/media_picker.js | Media/Sounds/Picker | Dashboard-Komponente |
| htdocs/dashboard/components/reactive_controls.js | Prüfen / fachlich einordnen | Dashboard-Komponente |

## Hinweise für Step 2

1. Diese Inventarliste muss lokal gegen `D:\Git\stream-control-center` geprüft werden.
2. Danach können veraltete Doku-Stände zusammengeführt werden.
3. Backup-Dateien neben produktivem Code gehören nicht in aktive Runtime-Ordner.
4. Dateien mit Kompatibilitätspfaden wie `htdocs/ws-client.js` und `htdocs/overlays/ws-client.js` nicht blind löschen.
