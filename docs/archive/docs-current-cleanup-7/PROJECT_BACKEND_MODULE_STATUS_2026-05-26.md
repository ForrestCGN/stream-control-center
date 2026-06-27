# PROJECT_BACKEND_MODULE_STATUS_2026-05-26

## Zweck

Diese Datei ist eine reine Bestandsaufnahme aus dem hochgeladenen aktuellen Backend-ZIP. Sie dient als Cleanup-/Doku-Grundlage und ersetzt keine Code-Pruefung im echten GitHub/dev-Stand.

## Quelle

```text
backend.zip
```

## Zusammenfassung

- Backend-Module ohne Helper: 49
- Helper-Dateien: 18
- erkannte Routen/Route-Hinweise: 527
- Module mit erkannter Versionskennung: 12
- Module ohne erkannte Versionskennung: 37
- Auffaellig: Im Backend-ZIP liegt `backend/data/app.sqlite`. Datenbanken duerfen nicht ins Repo und muessen vor Commit/Deploy ausgeschlossen bleiben.
- Ebenfalls auffaellig: `backend/modules/twitch.js.bak_original_uploaded` liegt im Upload. Backup-/Altdateien duerfen nicht ins Repo.

## Backend-Module

| Datei | Version | erkannte Routen | erkannte Abhaengigkeiten | Zeilen | Status |
|---|---:|---:|---|---:|---|
| `backend/modules/alert_system.js` | `nicht erkannt` | 45 | `communication_bus`, `database`, `helper_config`, `helper_media`, `helper_routes`, `helper_security`, `media`, `obs` ... | 5654 | aktiv/pruefen |
| `backend/modules/audit_log.js` | `0.2.0` | 5 | `database`, `helper_audit_log`, `helper_config`, `helper_security` | 251 | aktiv/pruefen |
| `backend/modules/birthday.js` | `nicht erkannt` | 0 | `database`, `helper_config`, `helper_media`, `helper_routes`, `helper_settings`, `helper_texts`, `media`, `sound_system` ... | 3551 | aktiv/pruefen |
| `backend/modules/bus_diagnostics.js` | `1.1.0` | 5 | `helper_routes` | 303 | aktiv/pruefen |
| `backend/modules/challenge.js` | `nicht erkannt` | 14 | `database`, `discord`, `helper_config`, `helper_messages`, `helper_routes`, `media`, `twitch` | 1376 | aktiv/pruefen |
| `backend/modules/chat_output.js` | `nicht erkannt` | 3 | `helper_messages`, `helper_routes` | 48 | aktiv/pruefen |
| `backend/modules/clip_shoutout.js` | `nicht erkannt` | 4 | `communication_bus`, `database`, `helper_config`, `media`, `stream_status`, `twitch` | 3026 | aktiv/pruefen |
| `backend/modules/clips.js` | `nicht erkannt` | 15 | `database`, `discord`, `helper_messages`, `helper_settings`, `helper_texts`, `obs`, `twitch` | 2281 | aktiv/pruefen |
| `backend/modules/commands.js` | `nicht erkannt` | 0 | `database`, `media`, `twitch` | 1014 | aktiv/pruefen |
| `backend/modules/commands_media.js` | `nicht erkannt` | 0 | `database`, `media`, `sound_system` | 295 | aktiv/pruefen |
| `backend/modules/communication_bus.js` | `0.8.1` | 12 | `communication_bus`, `helper_communication`, `helper_config`, `helper_security` | 927 | aktiv/pruefen |
| `backend/modules/credits.js` | `nicht erkannt` | 1 | `helper_routes` | 27 | aktiv/pruefen |
| `backend/modules/dashboard_auth.js` | `nicht erkannt` | 8 | `database`, `twitch` | 843 | aktiv/pruefen |
| `backend/modules/dashboard_controlcenter.js` | `nicht erkannt` | 11 | `twitch` | 116 | aktiv/pruefen |
| `backend/modules/database_core.js` | `nicht erkannt` | 1 | `database`, `helper_routes` | 23 | aktiv/pruefen |
| `backend/modules/deathcounter_v2.js` | `nicht erkannt` | 32 | `database`, `helper_config`, `helper_settings`, `helper_texts` | 4162 | aktiv/pruefen |
| `backend/modules/diagnostics.js` | `nicht erkannt` | 3 | `helper_routes` | 20 | aktiv/pruefen |
| `backend/modules/discord.js` | `nicht erkannt` | 28 | `discord`, `helper_config`, `helper_routes`, `media` | 1104 | aktiv/pruefen |
| `backend/modules/fireworks_api.js` | `nicht erkannt` | 3 |  | 42 | aktiv/pruefen |
| `backend/modules/hug.js` | `nicht erkannt` | 49 | `database`, `helper_config`, `helper_routes`, `twitch` | 1181 | aktiv/pruefen |
| `backend/modules/hug_system.js` | `nicht erkannt` | 6 | `helper_config`, `helper_routes`, `sqlite_core`, `twitch` | 969 | aktiv/pruefen |
| `backend/modules/kofi.js` | `nicht erkannt` | 5 | `database`, `helper_routes`, `twitch` | 708 | aktiv/pruefen |
| `backend/modules/loyalty.js` | `0.1.11` | 40 | `database`, `helper_config`, `helper_settings`, `helper_texts`, `twitch` | 3083 | aktiv/pruefen |
| `backend/modules/media.js` | `nicht erkannt` | 0 | `database`, `helper_config`, `helper_media`, `media`, `sound_system` | 1126 | aktiv/pruefen |
| `backend/modules/message_rotator.js` | `nicht erkannt` | 14 | `database`, `discord`, `helper_config`, `helper_routes`, `helper_security`, `helper_settings`, `helper_texts`, `twitch` | 1743 | aktiv/pruefen |
| `backend/modules/message_rotator_scheduler.js` | `nicht erkannt` | 14 | `database`, `helper_config`, `helper_routes`, `helper_security`, `helper_settings` | 499 | aktiv/pruefen |
| `backend/modules/messages.js` | `nicht erkannt` | 11 | `discord`, `helper_messages`, `helper_routes`, `helper_security`, `helper_texts`, `twitch` | 592 | aktiv/pruefen |
| `backend/modules/obs.js` | `nicht erkannt` | 33 | `helper_config`, `media`, `obs`, `stream_status` | 915 | aktiv/pruefen |
| `backend/modules/obs_shared.js` | `1.0.0` | 0 | `helper_config`, `media`, `obs` | 630 | aktiv/pruefen |
| `backend/modules/overlay_data.js` | `nicht erkannt` | 1 | `twitch` | 43 | aktiv/pruefen |
| `backend/modules/scene_control.js` | `1.2.1` | 11 | `obs` | 445 | aktiv/pruefen |
| `backend/modules/security.js` | `nicht erkannt` | 1 | `helper_routes`, `helper_security` | 57 | aktiv/pruefen |
| `backend/modules/sound_loudness_scanner.js` | `0.1.12-step272i5-scan-startedat-fix` | 0 | `database`, `discord`, `helper_media`, `helper_settings`, `media`, `sound_system` | 3012 | aktiv/pruefen |
| `backend/modules/sound_media_bridge.js` | `nicht erkannt` | 0 | `discord`, `helper_config`, `media`, `sound_system` | 324 | aktiv/pruefen |
| `backend/modules/sound_output_config.js` | `nicht erkannt` | 0 | `helper_config`, `sound_system` | 280 | aktiv/pruefen |
| `backend/modules/sound_system.js` | `nicht erkannt` | 0 | `communication_bus`, `database`, `discord`, `helper_config`, `helper_media`, `media`, `sound_system` | 3308 | aktiv/pruefen |
| `backend/modules/soundalerts_bridge.js` | `0.1.14` | 16 | `database`, `helper_config`, `helper_media`, `helper_settings`, `media`, `sound_system`, `twitch` | 1932 | aktiv/pruefen |
| `backend/modules/sqlite_core.js` | `nicht erkannt` | 0 | `database`, `helper_config`, `sqlite_core` | 193 | aktiv/pruefen |
| `backend/modules/start_overlay.js` | `0.3.0` | 5 | `helper_config`, `helper_messages`, `helper_routes`, `helper_texts` | 493 | aktiv/pruefen |
| `backend/modules/stream_status.js` | `nicht erkannt` | 0 | `database`, `helper_config`, `stream_status`, `twitch` | 653 | aktiv/pruefen |
| `backend/modules/tagebuch.js` | `nicht erkannt` | 0 | `database`, `discord`, `helper_config`, `helper_routes`, `helper_security`, `helper_settings`, `helper_texts`, `twitch` | 1549 | aktiv/pruefen |
| `backend/modules/tipeee.js` | `nicht erkannt` | 9 | `database`, `helper_routes`, `twitch` | 1104 | aktiv/pruefen |
| `backend/modules/todo.js` | `nicht erkannt` | 11 | `database`, `discord`, `helper_routes`, `helper_security`, `helper_settings`, `helper_texts`, `twitch` | 1191 | aktiv/pruefen |
| `backend/modules/tts_system.js` | `nicht erkannt` | 30 | `database`, `helper_config`, `helper_media`, `helper_settings`, `helper_texts`, `media`, `sound_system` | 2204 | aktiv/pruefen |
| `backend/modules/twitch.js` | `1` | 42 | `database`, `helper_config`, `helper_routes`, `twitch` | 3076 | aktiv/pruefen |
| `backend/modules/twitch_chat_overlay.js` | `0.5.0` | 14 | `helper_messages`, `helper_routes`, `twitch` | 1064 | aktiv/pruefen |
| `backend/modules/twitch_presence.js` | `nicht erkannt` | 25 | `database`, `helper_routes`, `twitch` | 1424 | aktiv/pruefen |
| `backend/modules/video_media_bridge.js` | `nicht erkannt` | 0 | `media`, `sound_system` | 291 | aktiv/pruefen |
| `backend/modules/vip_sound_overlay.js` | `1.8.15` | 0 | `communication_bus`, `database`, `discord`, `helper_config`, `helper_media`, `helper_messages`, `helper_settings`, `media` ... | 5812 | aktiv/pruefen |

## Helper-Dateien

| Datei | Version | Zeilen |
|---|---:|---:|
| `backend/modules/helpers/helper_audit_log.js` | `0.1.0` | 388 |
| `backend/modules/helpers/helper_chat_output.js` | `nicht erkannt` | 421 |
| `backend/modules/helpers/helper_communication.js` | `0.3.0` | 827 |
| `backend/modules/helpers/helper_config.js` | `nicht erkannt` | 310 |
| `backend/modules/helpers/helper_cooldown.js` | `nicht erkannt` | 179 |
| `backend/modules/helpers/helper_core.js` | `nicht erkannt` | 183 |
| `backend/modules/helpers/helper_dashboard_audit.js` | `nicht erkannt` | 38 |
| `backend/modules/helpers/helper_dashboard_auth.js` | `nicht erkannt` | 101 |
| `backend/modules/helpers/helper_media.js` | `nicht erkannt` | 212 |
| `backend/modules/helpers/helper_messages.js` | `nicht erkannt` | 145 |
| `backend/modules/helpers/helper_queue.js` | `nicht erkannt` | 120 |
| `backend/modules/helpers/helper_routes.js` | `nicht erkannt` | 69 |
| `backend/modules/helpers/helper_security.js` | `nicht erkannt` | 246 |
| `backend/modules/helpers/helper_security_context.js` | `0.1.0` | 529 |
| `backend/modules/helpers/helper_settings.js` | `nicht erkannt` | 367 |
| `backend/modules/helpers/helper_state.js` | `nicht erkannt` | 134 |
| `backend/modules/helpers/helper_texts.js` | `nicht erkannt` | 1017 |
| `backend/modules/helpers/helper_twitch_roles.js` | `nicht erkannt` | 279 |

## Hinweise zur Bewertung

- `nicht erkannt` bedeutet nur, dass keine einfache `moduleVersion`-/`version`-/`VERSION`-Kennung erkannt wurde.
- Dynamische Routen koennen fehlen, wenn sie nicht statisch aus dem Code auslesbar waren.
- Diese Datei ist fuer Cleanup und Orientierung gedacht. Vor Facharbeiten an einem Modul muss die konkrete echte Datei erneut vollstaendig geprueft werden.
