# STEP532 – TODO Rescue Report

Stand: 2026-05-29

## Ziel

Diese Datei filtert aus den 1914 TODO-/OFFEN-Treffern diejenigen heraus, die eher echte Aufgaben oder offene Entscheidungen sind.

Nicht alle Treffer sind echte TODOs. Viele Treffer sind nur Namen wie `todo.js`, generierte Routen oder Tabellen.

## Auffällige echte Themencluster

- Alert-System: Provider-Safety, Tipeee/Twitch-Event-Vermischung, Gift-Sub-Stufen, TTS/Overlay-Feinschliff.
- Sound-System/SoundBus: Consumer, Dashboard-Monitoring, offene Control-/Refresh-Themen.
- Overlay/EventBus: Overlay-Hello/Registrierung, Master-Overlay, Reconnect/Direct-Overlay-Regeln.
- Modul-Doku: viele Deep-Dives enthalten generische „Offene Punkte“-Abschnitte.
- Datenbank/Portabilität: alte MariaDB-/DB-Core-Portability-Hinweise in archivierten STEP-Dokus.
- Doku-Struktur: Append-Dateien und alte STEP-Dokus sollen konsolidiert werden.

## Gefilterte TODO-/OFFEN-Kandidaten

```text
docs/archive/2026-05-11-step233/current/CURRENT_SYSTEM_STATUS_STEP201_SAVE_2026-05-08.md:39 | todo
docs/archive/2026-05-11-step233/current/CURRENT_SYSTEM_STATUS_STEP201_SAVE_2026-05-08.md:268 | ## Wichtiger offener Punkt
docs/archive/2026-05-11-step233/current/SOUNDALERTS_MEDIA_REPLAY_NEXT_STEPS_2026-05-06.md:54 | - Buttons sollen spaeter sein:
docs/archive/2026-05-11-step233/current/SOUNDALERTS_MEDIA_REPLAY_NEXT_STEPS_2026-05-06.md:70 | Ein allgemeines Upload-System fuer Sound- und Video-Dateien bauen. Nicht nur SoundAlerts-spezifisch, damit spaeter VIP, Alerts, Sound-System und andere Module dieselbe Medienverwaltung nutzen koennen.
docs/archive/2026-05-11-step233/current/SOUNDALERTS_MEDIA_REPLAY_NEXT_STEPS_2026-05-06.md:185 | - Loeschen spaeter nur mit Sicherheitsabfrage.
docs/archive/2026-05-11-step233/current/SOUNDALERTS_MEDIA_REPLAY_NEXT_STEPS_2026-05-06.md:199 | ## Bewusst offen
docs/archive/2026-05-11-step233/current/STEP200_4_STATUS_NOTE_2026-05-08.md:26 | ## Nicht betroffen
docs/archive/2026-05-11-step233/current/STEP200_5_STATUS_NOTE_2026-05-08.md:25 | ## Offene Folgeaufgaben
docs/archive/2026-05-11-step233/current/STEP201_3C_FIX_STATUS_NOTE_2026-05-08.md:1 | # STEP201.3c Fix Status-Notiz – Todo Integration-Check 500
docs/archive/2026-05-11-step233/current/STEP201_3C_FIX_STATUS_NOTE_2026-05-08.md:8 | /api/todo/integration-check -> 500 leerer Body
docs/archive/2026-05-11-step233/current/STEP201_3C_FIX_STATUS_NOTE_2026-05-08.md:15 | buildTodoIntegrationCheck robuster gemacht
docs/archive/2026-05-11-step233/current/STEP201_3C_FIX_STATUS_NOTE_2026-05-08.md:23 | node --check backend\modules\todo.js
docs/archive/2026-05-11-step233/current/STEP201_3C_FIX_STATUS_NOTE_2026-05-08.md:24 | powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3c_fix_test_todo_integration_check.ps1
docs/archive/2026-05-11-step233/current/STEP201_3C_FIX2_STATUS_NOTE_2026-05-08.md:1 | # STEP201.3c Fix 2 Status-Notiz – Todo Textspalten
docs/archive/2026-05-11-step233/current/STEP201_3C_FIX2_STATUS_NOTE_2026-05-08.md:8 | /api/todo/integration-check -> ok false
docs/archive/2026-05-11-step233/current/STEP201_3C_FIX2_STATUS_NOTE_2026-05-08.md:21 | node --check backend\modules\todo.js
docs/archive/2026-05-11-step233/current/STEP201_3C_FIX2_STATUS_NOTE_2026-05-08.md:22 | powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3c_fix2_test_todo_integration_check.ps1
docs/archive/2026-05-11-step233/current/STEP201_3C_STATUS_NOTE_2026-05-08.md:1 | # STEP201.3c Status-Notiz – Todo /routes + /integration-check
docs/archive/2026-05-11-step233/current/STEP201_3C_STATUS_NOTE_2026-05-08.md:10 | GET /api/todo/routes
docs/archive/2026-05-11-step233/current/STEP201_3C_STATUS_NOTE_2026-05-08.md:11 | GET /api/todo/integration-check
docs/archive/2026-05-11-step233/current/STEP201_3C_STATUS_NOTE_2026-05-08.md:12 | GET /api/todo/config
docs/archive/2026-05-11-step233/current/STEP201_3C_STATUS_NOTE_2026-05-08.md:13 | GET /api/todo/settings
docs/archive/2026-05-11-step233/current/STEP201_3C_STATUS_NOTE_2026-05-08.md:29 | node --check backend\modules\todo.js
docs/archive/2026-05-11-step233/current/STEP201_3C_STATUS_NOTE_2026-05-08.md:30 | powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3c_test_todo_routes_integration_check.ps1
docs/archive/2026-05-11-step233/current/STEP201_6_CHALLENGE_DIAGNOSTICS_STATUS_2026-05-08.md:116 | ## Bewusst offen
docs/archive/2026-05-11-step233/current/STEP201_INTERMEDIATE_MATRIX_STATUS_2026-05-08.md:11 | Todo
docs/archive/2026-05-11-step233/current/STEP201_INTERMEDIATE_MATRIX_STATUS_2026-05-08.md:40 | todo
docs/archive/2026-05-11-step233/handoffs/NEXT_CHAT_HANDOFF_STEP201_2026-05-08.md:44 | todo
docs/archive/2026-05-11-step233/handoffs/NEXT_CHAT_HANDOFF_STEP201_2026-05-08.md:94 | ## Offener Punkt
docs/archive/2026-05-11-step233/handoffs/NEXT_CHAT_HANDOFF_STEP204_ALERTS_2026-05-09.md:28 | Nach Deploy Testscript ausfuehren und Events pruefen. Danach Live-Regeln korrigieren:
docs/archive/2026-05-11-step233/handoffs/NEXT_CHAT_HANDOFF_STEP204_ALERTS_2026-05-09.md:32 | - `gift_bomb` Stufen 5-9, 10-20, 21-49, 50+ pruefen/ergaenzen.
docs/archive/2026-05-11-step233/handoffs/NEXT_CHAT_HANDOFF_STEP206_ALERT_TTS_2026-05-09.md:38 | Pruefen:
docs/archive/2026-05-11-step233/handoffs/NEXT_CHAT_HANDOFF_STEP207_1_ALERT_TTS_2026-05-09.md:58 | ## Offene nächste Arbeit
docs/archive/2026-05-11-step233/handoffs/NEXT_CHAT_HANDOFF_STEP209_ALERT_MESSAGE_TEXT_SETTINGS_2026-05-09.md:54 | ## Offene spätere Aufgabe
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:40 | 5. Es liegen viele Backup-Dateien direkt im modules-Ordner. Sie werden aktuell nicht geladen, sollten aber spaeter in archive/ oder data/backups/ verschoben werden.
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:81 | /data      -> D:\Streaming\stramAssets\htdocs\data   [Legacy, bewusst noch offen]
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:156 | - DB-Fassade fuer spaetere Adapter
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:169 | - todo.js: Todo-Stats
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:206 | Wichtig fuer spaetere Zentralisierung von Chat-Nachrichten.
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:353 | Todo:
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:354 | todo.js
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:355 | Zweck: ToDo-Eintraege per Chat/Discord, Ziel-Aliase, Stats.
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:358 | config/messages/todo.json
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:359 | SQLite todo-Stats
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:761 | TODO
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:762 | GET      /discord/todo/status
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:763 | GET      /api/todo/status
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:764 | GET/POST /discord/todo
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:765 | GET/POST /api/todo/add
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:766 | GET      /api/todo/stats
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:767 | GET      /api/todo/stats/top
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:768 | GET      /api/todo/stats/today
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:769 | GET/POST /api/todo/reload
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:986 | - /discord/todo und /api/todo/add
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:991 | Erst dokumentieren, dann spaeter pro Modul entscheiden, welche Route offiziell ist.
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:1076 | config/messages/todo.json
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:1121 | /api/todo/*
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:1133 | /discord/todo
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:1163 | Spaeter zusaetzlich /api/deathcounter/* anbieten.
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:1179 | Fuer gefaehrliche Routen wie Config-Saves, OBS-Steuerung, Sound-Steuerung, Alert-Uploads spaeter Rechte/Audit einbauen.
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:1198 | Invoke-RestMethod "http://127.0.0.1:8080/api/todo/status" | ConvertTo-Json -Depth 10
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:1221 | - Sound/Alerts/Hug/Tagebuch/Todo als Dashboard-Module sauber einhaengen
docs/backend/Backend_Systemuebersicht_2026-05-03.txt:1241 | Nichts entfernen, bevor die betroffene Route getestet und ein Legacy-Alias gesichert ist.
docs/backend/SOUNDBUS_CONSUMER_DASHBOARD_PLAN_STEP298.md:200 | ## Offene technische Punkte
docs/backend/SOUNDBUS_CONSUMER_INTEGRATION_STEP310.md:9 | Betroffene Systeme/Quellen:
docs/current/CURRENT_SYSTEM_STATUS_STEP366_KNOWN_ISSUE_APPEND.md:1 | # CURRENT_SYSTEM_STATUS Append: STEP366 Known Issue
docs/current/CURRENT_SYSTEM_STATUS_STEP366_KNOWN_ISSUE_APPEND.md:3 | ## Offener Befund
docs/current/CURRENT_SYSTEM_STATUS_STEP368_APPEND.md:20 | ## Weiterhin offen
docs/current/CURRENT_SYSTEM_STATUS_STEP369_APPEND.md:17 | ### Offene Folgearbeit
docs/current/CURRENT_SYSTEM_STATUS_STEP369_APPEND.md:25 | ### Offener separater Known-Issue
docs/current/CURRENT_SYSTEM_STATUS_STEP369_APPEND.md:27 | Unabhängig vom Alert-Bus bleibt offen:
docs/current/CURRENT_SYSTEM_STATUS_STEP371_APPEND.md:29 | ### Offene Punkte
docs/current/CURRENT_SYSTEM_STATUS_STEP371_APPEND.md:33 | - Known Issue bleibt separat: verwaister Sound-System `activeBundleLock` kann Birthday/VIP blockieren.
docs/current/CURRENT_SYSTEM_STATUS_STEP392_APPEND.md:34 | ## Offene Feintuning-Notiz
docs/current/HANDOFF_DOCUMENTATION_UPDATE_RULE_2026-05-26.md:34 | docs/modules/<betroffene-modul-dokus>.md
docs/current/HANDOFF_DOCUMENTATION_UPDATE_RULE_2026-05-26.md:50 | - erledigte TODOs
docs/current/HANDOFF_DOCUMENTATION_UPDATE_RULE_2026-05-26.md:51 | - neue TODOs
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md:67 | ## Offene Doku-Punkte
docs/current/MODULE_DOCS_VERSION_EVENTBUS_RULES_2026-05-26.md:44 | offene Punkte
docs/current/MODULE_DOCS_VERSION_EVENTBUS_RULES_2026-05-26.md:113 | ## Offene Folgearbeit
docs/current/PROJECT_ACTIVE_SYSTEM_OVERVIEW_2026-05-11.md:96 | |todo|nein|19 statisch / 15 Strings|-|
docs/current/PROJECT_ACTIVE_SYSTEM_OVERVIEW_2026-05-11.md:120 | |todo|Todo|community|ja|ja|ja|
docs/current/PROJECT_ACTIVE_SYSTEM_OVERVIEW_2026-05-11.md:131 | - Viele alte Test-/STEP-Skripte liegen noch unter `tools/`. Diese wurden nicht archiviert, weil STEP233 nur Doku-Fragmente betroffen hat.
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:27 | | `backend/modules/alert_system.js` | `nicht erkannt` | 45 | `communication_bus`, `database`, `helper_config`, `helper_media`, `helper_routes`, `helper_security`, `media`, `obs` ... | 5654 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:28 | | `backend/modules/audit_log.js` | `0.2.0` | 5 | `database`, `helper_audit_log`, `helper_config`, `helper_security` | 251 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:29 | | `backend/modules/birthday.js` | `nicht erkannt` | 0 | `database`, `helper_config`, `helper_media`, `helper_routes`, `helper_settings`, `helper_texts`, `media`, `sound_system` ... | 3551 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:30 | | `backend/modules/bus_diagnostics.js` | `1.1.0` | 5 | `helper_routes` | 303 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:31 | | `backend/modules/challenge.js` | `nicht erkannt` | 14 | `database`, `discord`, `helper_config`, `helper_messages`, `helper_routes`, `media`, `twitch` | 1376 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:32 | | `backend/modules/chat_output.js` | `nicht erkannt` | 3 | `helper_messages`, `helper_routes` | 48 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:33 | | `backend/modules/clip_shoutout.js` | `nicht erkannt` | 4 | `communication_bus`, `database`, `helper_config`, `media`, `stream_status`, `twitch` | 3026 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:34 | | `backend/modules/clips.js` | `nicht erkannt` | 15 | `database`, `discord`, `helper_messages`, `helper_settings`, `helper_texts`, `obs`, `twitch` | 2281 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:35 | | `backend/modules/commands.js` | `nicht erkannt` | 0 | `database`, `media`, `twitch` | 1014 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:36 | | `backend/modules/commands_media.js` | `nicht erkannt` | 0 | `database`, `media`, `sound_system` | 295 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:37 | | `backend/modules/communication_bus.js` | `0.8.1` | 12 | `communication_bus`, `helper_communication`, `helper_config`, `helper_security` | 927 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:38 | | `backend/modules/credits.js` | `nicht erkannt` | 1 | `helper_routes` | 27 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:39 | | `backend/modules/dashboard_auth.js` | `nicht erkannt` | 8 | `database`, `twitch` | 843 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:40 | | `backend/modules/dashboard_controlcenter.js` | `nicht erkannt` | 11 | `twitch` | 116 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:41 | | `backend/modules/database_core.js` | `nicht erkannt` | 1 | `database`, `helper_routes` | 23 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:42 | | `backend/modules/deathcounter_v2.js` | `nicht erkannt` | 32 | `database`, `helper_config`, `helper_settings`, `helper_texts` | 4162 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:43 | | `backend/modules/diagnostics.js` | `nicht erkannt` | 3 | `helper_routes` | 20 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:44 | | `backend/modules/discord.js` | `nicht erkannt` | 28 | `discord`, `helper_config`, `helper_routes`, `media` | 1104 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:45 | | `backend/modules/fireworks_api.js` | `nicht erkannt` | 3 |  | 42 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:46 | | `backend/modules/hug.js` | `nicht erkannt` | 49 | `database`, `helper_config`, `helper_routes`, `twitch` | 1181 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:47 | | `backend/modules/hug_system.js` | `nicht erkannt` | 6 | `helper_config`, `helper_routes`, `sqlite_core`, `twitch` | 969 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:48 | | `backend/modules/kofi.js` | `nicht erkannt` | 5 | `database`, `helper_routes`, `twitch` | 708 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:49 | | `backend/modules/loyalty.js` | `0.1.11` | 40 | `database`, `helper_config`, `helper_settings`, `helper_texts`, `twitch` | 3083 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:50 | | `backend/modules/media.js` | `nicht erkannt` | 0 | `database`, `helper_config`, `helper_media`, `media`, `sound_system` | 1126 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:51 | | `backend/modules/message_rotator.js` | `nicht erkannt` | 14 | `database`, `discord`, `helper_config`, `helper_routes`, `helper_security`, `helper_settings`, `helper_texts`, `twitch` | 1743 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:52 | | `backend/modules/message_rotator_scheduler.js` | `nicht erkannt` | 14 | `database`, `helper_config`, `helper_routes`, `helper_security`, `helper_settings` | 499 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:53 | | `backend/modules/messages.js` | `nicht erkannt` | 11 | `discord`, `helper_messages`, `helper_routes`, `helper_security`, `helper_texts`, `twitch` | 592 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:54 | | `backend/modules/obs.js` | `nicht erkannt` | 33 | `helper_config`, `media`, `obs`, `stream_status` | 915 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:55 | | `backend/modules/obs_shared.js` | `1.0.0` | 0 | `helper_config`, `media`, `obs` | 630 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:56 | | `backend/modules/overlay_data.js` | `nicht erkannt` | 1 | `twitch` | 43 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:57 | | `backend/modules/scene_control.js` | `1.2.1` | 11 | `obs` | 445 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:58 | | `backend/modules/security.js` | `nicht erkannt` | 1 | `helper_routes`, `helper_security` | 57 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:59 | | `backend/modules/sound_loudness_scanner.js` | `0.1.12-step272i5-scan-startedat-fix` | 0 | `database`, `discord`, `helper_media`, `helper_settings`, `media`, `sound_system` | 3012 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:60 | | `backend/modules/sound_media_bridge.js` | `nicht erkannt` | 0 | `discord`, `helper_config`, `media`, `sound_system` | 324 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:61 | | `backend/modules/sound_output_config.js` | `nicht erkannt` | 0 | `helper_config`, `sound_system` | 280 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:62 | | `backend/modules/sound_system.js` | `nicht erkannt` | 0 | `communication_bus`, `database`, `discord`, `helper_config`, `helper_media`, `media`, `sound_system` | 3308 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:63 | | `backend/modules/soundalerts_bridge.js` | `0.1.14` | 16 | `database`, `helper_config`, `helper_media`, `helper_settings`, `media`, `sound_system`, `twitch` | 1932 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:64 | | `backend/modules/sqlite_core.js` | `nicht erkannt` | 0 | `database`, `helper_config`, `sqlite_core` | 193 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:65 | | `backend/modules/start_overlay.js` | `0.3.0` | 5 | `helper_config`, `helper_messages`, `helper_routes`, `helper_texts` | 493 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:66 | | `backend/modules/stream_status.js` | `nicht erkannt` | 0 | `database`, `helper_config`, `stream_status`, `twitch` | 653 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:67 | | `backend/modules/tagebuch.js` | `nicht erkannt` | 0 | `database`, `discord`, `helper_config`, `helper_routes`, `helper_security`, `helper_settings`, `helper_texts`, `twitch` | 1549 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:68 | | `backend/modules/tipeee.js` | `nicht erkannt` | 9 | `database`, `helper_routes`, `twitch` | 1104 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:69 | | `backend/modules/todo.js` | `nicht erkannt` | 11 | `database`, `discord`, `helper_routes`, `helper_security`, `helper_settings`, `helper_texts`, `twitch` | 1191 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:70 | | `backend/modules/tts_system.js` | `nicht erkannt` | 30 | `database`, `helper_config`, `helper_media`, `helper_settings`, `helper_texts`, `media`, `sound_system` | 2204 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:71 | | `backend/modules/twitch.js` | `1` | 42 | `database`, `helper_config`, `helper_routes`, `twitch` | 3076 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:72 | | `backend/modules/twitch_chat_overlay.js` | `0.5.0` | 14 | `helper_messages`, `helper_routes`, `twitch` | 1064 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:73 | | `backend/modules/twitch_presence.js` | `nicht erkannt` | 25 | `database`, `helper_routes`, `twitch` | 1424 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:74 | | `backend/modules/video_media_bridge.js` | `nicht erkannt` | 0 | `media`, `sound_system` | 291 | aktiv/pruefen |
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md:75 | | `backend/modules/vip_sound_overlay.js` | `1.8.15` | 0 | `communication_bus`, `database`, `discord`, `helper_config`, `helper_media`, `helper_messages`, `helper_settings`, `media` ... | 5812 | aktiv/pruefen |
docs/current/PROJECT_CLEANUP_PLAN_2026-05-11.md:64 | ## Weiter offen
docs/current/PROJECT_CLEANUP_PLAN_2026-05-11.md:66 | - Docs/current kann spaeter in einem eigenen STEP weiter archiviert werden.
docs/current/PROJECT_CLEANUP_PLAN_2026-05-11.md:67 | - Modul-Dokus koennen spaeter pro System vereinheitlicht werden.
docs/current/PROJECT_CLEANUP_PLAN_2026-05-11.md:68 | - Automatisch generierte Karten koennen spaeter mit einem Generator aktualisiert werden.
docs/current/PROJECT_CONFIG_DATABASE_MAP_2026-05-11.md:77 | |config/messages/todo.json|keys: 13|
docs/current/PROJECT_CONFIG_DATABASE_MAP_2026-05-11.md:113 | |backend\modules\todo|ja|nein|ja|todo_settings|todo_daily_stats, todo_user_stats|
docs/current/PROJECT_CONFIG_DATABASE_MAP_2026-05-11.md:130 | todo_settings
docs/current/PROJECT_CONFIG_DATABASE_MAP_2026-05-11.md:140 | Aktuelle bestätigte Module: message_rotator, tagebuch, todo, clips, tts/vip je nach Modulstand prüfen
docs/current/PROJECT_DASHBOARD_MAP_2026-05-11.md:32 | |todo|Todo|community|ja|ja|ja|
docs/current/PROJECT_DASHBOARD_MAP_2026-05-11.md:68 | |todo|Todo|true|
docs/current/PROJECT_DOCS_CLEANUP_NOTES_2026-05-26.md:29 | - spaeter optional Archiv-/Bereinigungs-STEP planen
docs/current/PROJECT_DOCUMENTATION_MAP_2026-05-11.md:34 | docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:43 | |todo|19|15|/api/todo/add, /api/todo/add, /api/todo/admin/settings, /api/todo/admin/settings, /api/todo/admin/texts|
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:596 | ## todo
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:598 | - `? /api/todo`
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:599 | - `GET /api/todo/add`
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:600 | - `GET /api/todo/admin/settings`
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:601 | - `GET /api/todo/admin/texts`
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:602 | - `GET /api/todo/config`
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:603 | - `GET /api/todo/integration-check`
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:604 | - `GET /api/todo/reload`
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:605 | - `GET /api/todo/routes`
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:606 | - `GET /api/todo/settings`
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:607 | - `GET /api/todo/stats`
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:608 | - `GET /api/todo/stats/today`
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:609 | - `GET /api/todo/stats/top`
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:610 | - `GET /api/todo/status`
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md:611 | - `GET /discord/todo`
```

## Nicht automatisch übernehmen

Nicht automatisch übernehmen:

- `docs/_generated/*`
- reine Funktionsnamen
- reine Routenlisten
- archivierte STEP-Historie ohne aktuellen Bezug
- generische Überschriften wie „Betroffene Datei“
- bereits erledigte Diagnose-Notizen

## Empfohlene Rettungsziele

| Art | Ziel |
|---|---|
| aktueller Systemzustand | `docs/current/CURRENT_SYSTEM_STATUS.md` |
| konkrete nächste Arbeit | `project-state/NEXT_STEPS.md` |
| langfristige offene Aufgaben | `project-state/TODO.md` |
| Moduldetails | passende `docs/modules/*.md` |
| reine Historie | Archiv lassen |
