# Aktueller Modulstatus

Stand: 2026-06-01
Quelle: letzter `/api/_status` nach STEP278 Block 34b.

## Zusammenfassung

```text
Module insgesamt: 52
Geladen: 51
Skipped: 1
Geladene Module ohne saubere Runtime-Meta: 0
```

## Bewertung

```text
Alle geladenen Runtime-Module sind sauber.
obs_shared.js bleibt absichtlich skipped, weil es kein Runtime-Modul mit init ist.
```

## Modulmatrix

| Modul | Version | Type | Status | Meta | Legacy |
|---|---:|---|---|---:|---:|
| `alert_system.js` | `3.1.4` | `runtime` | `loaded` | `true` | `false` |
| `audit_log.js` | `0.2.0` | `runtime` | `loaded` | `true` | `false` |
| `birthday.js` | `0.6.0` | `runtime` | `loaded` | `true` | `false` |
| `bus_diagnostics.js` | `1.1.0` | `runtime` | `loaded` | `true` | `false` |
| `challenge.js` | `2.0.0` | `runtime` | `loaded` | `true` | `false` |
| `channelpoints.js` | `0.9.13` | `runtime` | `loaded` | `true` | `false` |
| `channelpoints_eventsub_bus_bridge.js` | `0.9.1` | `runtime` | `loaded` | `true` | `false` |
| `channelpoints_twitch_readonly_sync.js` | `0.8.3` | `runtime` | `loaded` | `true` | `false` |
| `chat_output.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `clip_shoutout.js` | `0.2.13` | `runtime` | `loaded` | `true` | `false` |
| `clips.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `commands.js` | `0.1.6` | `runtime` | `loaded` | `true` | `false` |
| `commands_media.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `communication_bus.js` | `0.8.3` | `runtime` | `loaded` | `true` | `false` |
| `credits.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `dashboard_auth.js` | `2.0.0` | `runtime` | `loaded` | `true` | `false` |
| `dashboard_controlcenter.js` | `0.0.7` | `runtime` | `loaded` | `true` | `false` |
| `database_core.js` | `0.1.3` | `runtime` | `loaded` | `true` | `false` |
| `deathcounter_v2.js` | `2.0.0` | `runtime` | `loaded` | `true` | `false` |
| `diagnostics.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `discord.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `fireworks_api.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `hug.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `kofi.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `loyalty.js` | `0.1.11` | `runtime` | `loaded` | `true` | `false` |
| `media.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `message_rotator.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `message_rotator_scheduler.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `messages.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `obs.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `overlay_data.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `overlay_monitor.js` | `0.1.6` | `runtime` | `loaded` | `true` | `false` |
| `scene_control.js` | `1.2.1` | `runtime` | `loaded` | `true` | `false` |
| `security.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `sound_loudness_scanner.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `sound_media_bridge.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `sound_output_config.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `sound_system.js` | `0.1.18` | `runtime` | `loaded` | `true` | `false` |
| `soundalerts_bridge.js` | `0.1.14` | `runtime` | `loaded` | `true` | `false` |
| `sqlite_core.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `start_overlay.js` | `0.3.0` | `runtime` | `loaded` | `true` | `false` |
| `stream_status.js` | `0.1.2` | `runtime` | `loaded` | `true` | `false` |
| `tagebuch.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `tipeee.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `todo.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `tts_system.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `twitch.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `twitch_chat_overlay.js` | `0.5.0` | `runtime` | `loaded` | `true` | `false` |
| `twitch_presence.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `video_media_bridge.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `vip_sound_overlay.js` | `0.1.0` | `runtime` | `loaded` | `true` | `false` |
| `obs_shared.js` | `unknown` | `unknown` | `skipped: no_init_export` | `false` | `false` |
