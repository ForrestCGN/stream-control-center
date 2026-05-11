# STEP258 DeathCounter DB-Storage Update

DeathCounter V2 nutzt jetzt die vorbereiteten Tabellen als aktive Storage-Quelle:

```text
deathcounter_players
deathcounter_games
deathcounter_counts
deathcounter_overlay_state
deathcounter_events
```

`deathcounter.v2.json` bleibt als synchronisierter Fallback erhalten. Neue DeathCounter-State-Aenderungen werden per Dual-Write in DB und JSON geschrieben. Es gibt keinen optionalen Storage-Schalter.

---

# STEP257 DeathCounter DB-/Storage-Ergaenzung

DeathCounter V2 nutzt weiterhin `data/deathcounter/deathcounter.v2.json` als aktiven produktiven Storage. Die importierten DB-Tabellen koennen jetzt read-only zu einem Public-State zusammengesetzt und gegen JSON verglichen werden.

Neue/ relevante DeathCounter-Routen:

```text
GET  /api/deathcounter/v2/storage/preview
GET  /api/deathcounter/v2/storage/validate
POST /api/deathcounter/v2/storage/import
GET  /api/deathcounter/v2/storage/consistency
GET  /api/deathcounter/v2/storage/read-test
```

`/storage/read-test` schreibt nichts und aktiviert keinen DB-Storage.

---

# STEP256 DeathCounter DB-/Storage-Ergaenzung

DeathCounter V2 nutzt weiterhin `data/deathcounter/deathcounter.v2.json` als aktiven produktiven Storage, hat aber vorbereitete/importierte DB-Tabellen und nun einen Read-only-Konsistenzcheck.

Neue/ relevante DeathCounter-Routen:

```text
GET  /api/deathcounter/v2/storage/preview
GET  /api/deathcounter/v2/storage/validate
POST /api/deathcounter/v2/storage/import
GET  /api/deathcounter/v2/storage/consistency
```

DeathCounter-Tabellen:

```text
deathcounter_players
deathcounter_games
deathcounter_counts
deathcounter_overlay_state
deathcounter_events
```

`/storage/consistency` vergleicht JSON-State gegen importierte DB-Zeilen, schreibt nichts und schaltet keinen Storage um.

---

# PROJECT CONFIG AND DATABASE MAP

Stand: 2026-05-11  
Quelle: `stream-control-center_step234_source.zip`.

## Grundregel

SQLite bleibt produktiver Standard/Fallback. Neue DB-Zugriffe sollen ueber `backend/core/database.js` oder vorhandene Helper gekapselt werden. Direkte neue Kopplung an `sqlite_core.js` vermeiden.

## Core-/DB-Dateien

```text
backend/core/database.js
backend/modules/sqlite_core.js
backend/modules/helpers/helper_settings.js
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_config.js
```

## Config-Dateien

|Datei|Hinweis|
|---|---|
|config/alert_system.json|-|
|config/alerts_tipeee.example.json|-|
|config/challenge_system.json|-|
|config/chat_output.json|-|
|config/clip_system.json|-|
|config/dashboard_access.json|-|
|config/dashboard_admin_configs.json|-|
|config/dashboard_backend_general.json|-|
|config/dashboard_env_strategy.json|-|
|config/dashboard_logging.json|-|
|config/dashboard_navigation.json|-|
|config/dashboard_permissions.json|-|
|config/dashboard_roles.json|-|
|config/discord_channels.json|-|
|config/hug_system.json|-|
|config/loyalty.json|-|
|config/message_rotator.json|-|
|config/obs_dashboard.json|-|
|config/scene_aliases.json|-|
|config/security.json|-|
|config/sound_system.json|-|
|config/soundalerts_bridge.json|-|
|config/start_overlay.json|-|
|config/streamdesk.json|-|
|config/tagebuch.json|-|
|config/tools.json|-|
|config/tts_bans.json|-|
|config/tts_config.json|-|
|config/tts_messages.json|-|
|config/twitch_alerts.json|-|
|config/twitch_dashboard_auth.json|-|
|config/vip_sound_roles.json|-|

## Message/Text-Config-Fallbacks

Diese Dateien bleiben Fallback/Seed/Legacy. Dashboard-faehige Texte sollen langfristig ueber DB-Textvarianten laufen.

|Datei|Inhalt|
|---|---|
|config/messages/alerts.json|keys: 4|
|config/messages/challenge.json|keys: 2|
|config/messages/clips.json|keys: 8|
|config/messages/community.json|keys: 3|
|config/messages/discord.json|keys: 2|
|config/messages/follow.json|keys: 2|
|config/messages/hug.json|keys: 5|
|config/messages/placeholders.json|keys: 2|
|config/messages/respect.json|keys: 2|
|config/messages/sound_system.json|keys: 13|
|config/messages/start_overlay.json|keys: 4|
|config/messages/streamerbot.json|keys: 3|
|config/messages/system.json|keys: 4|
|config/messages/tagebuch.json|keys: 17|
|config/messages/todo.json|keys: 13|
|config/messages/youtube.json|keys: 2|

## DB-/Settings-Nutzung nach Modul

|Modul|core/database|sqlite_core direkt|helper_settings|Settings-Tabellen|erkannte Tabellen|
|---|---|---|---|---|---|
|backend\modules\alert_system|ja|nein|nein|-|alert_assets, alert_chat_blocks, alert_chat_outbox, alert_display_profiles, alert_events, alert_rules, alert_settings, alert_test_presets, alert_text_variants, alert_types|
|backend\modules\challenge|ja|nein|nein|-|challenge_runtime_events, challenge_user_mode_stats|
|backend\modules\chat_output|nein|nein|nein|-|-|
|backend\modules\clips|ja|nein|ja|clip_settings|-|
|backend\modules\credits|nein|nein|nein|-|-|
|backend\modules\dashboard_auth|ja|nein|nein|-|dashboard_audit_log, dashboard_identities, dashboard_permissions, dashboard_roles, dashboard_sessions, dashboard_users|
|backend\modules\dashboard_controlcenter|nein|nein|nein|-|-|
|backend\modules\database_core|ja|nein|nein|-|-|
|backend\modules\deathcounter_v2|ja|nein|ja|deathcounter_settings|deathcounter_players, deathcounter_games, deathcounter_counts, deathcounter_overlay_state, deathcounter_events|
|backend\modules\diagnostics|nein|nein|nein|-|-|
|backend\modules\discord|nein|nein|nein|-|-|
|backend\modules\fireworks_api|nein|nein|nein|-|-|
|backend\modules\hug|ja|nein|nein|-|hug_pair_stats, hug_pending_rehugs, hug_settings, hug_text_pairs, hug_texts, hug_types, hug_users|
|backend\modules\kofi|ja|nein|nein|-|alert_provider_events, alert_rules, alert_settings, alert_types|
|backend\modules\loyalty|ja|nein|ja|loyalty_settings|loyalty_events, loyalty_ignored_users, loyalty_imports, loyalty_reservations, loyalty_runner_events, loyalty_stream_state, loyalty_transactions, loyalty_users, loyalty_watch_state|
|backend\modules\message_rotator|nein|nein|ja|message_rotator_settings|-|
|backend\modules\messages|nein|nein|nein|-|-|
|backend\modules\obs|nein|nein|nein|-|-|
|backend\modules\obs_shared|nein|nein|nein|-|-|
|backend\modules\overlay_data|nein|nein|nein|-|-|
|backend\modules\scene_control|nein|nein|nein|-|-|
|backend\modules\security|nein|nein|nein|-|-|
|backend\modules\sound_output_config|nein|nein|nein|-|-|
|backend\modules\sound_system|ja|nein|nein|sound_settings|sound_settings|
|backend\modules\soundalerts_bridge|ja|nein|ja|soundalerts_bridge_settings|soundalerts_bridge_entries, soundalerts_bridge_events, soundalerts_bridge_meta|
|backend\modules\sqlite_core|nein|nein|nein|-|schema_versions|
|backend\modules\start_overlay|nein|nein|nein|-|-|
|backend\modules\tagebuch|ja|nein|ja|tagebuch_settings|tagebuch_daily_user_stats, tagebuch_runtime_events, tagebuch_state, tagebuch_state_new, tagebuch_user_stats|
|backend\modules\tipeee|ja|nein|nein|-|alert_provider_events, alert_rules, alert_settings, alert_types|
|backend\modules\todo|ja|nein|ja|todo_settings|todo_daily_stats, todo_user_stats|
|backend\modules\tts_system|ja|nein|ja|tts_settings|tts_events, tts_usage_daily|
|backend\modules\twitch|ja|nein|nein|-|alert_settings|
|backend\modules\twitch_chat_overlay|nein|nein|nein|-|-|
|backend\modules\twitch_presence|ja|nein|nein|-|twitch_presence_activity|
|backend\modules\vip_sound_overlay|ja|nein|ja|vip_sound_settings|vip_sound_daily_usage, vip_sound_events, vip_sound_message_templates, vip_sound_role_overrides, vip_sound_settings, vip_sound_twitch_users|

## Bekannte Settings-Tabellen

```text
alert_settings
clip_settings
loyalty_settings
message_rotator_settings
sound_settings
soundalerts_bridge_settings
tagebuch_settings
todo_settings
tts_settings
vip_sound_settings
```

## Textvarianten-System

```text
Primäre Tabelle: module_text_variants
Legacy/Fallback-Tabelle: module_texts
Aktuelle bestätigte Module: message_rotator, tagebuch, todo, clips, tts/vip je nach Modulstand prüfen
```

## Wichtige Vorsichtspunkte

- `app.sqlite` niemals ersetzen oder neu bauen.
- Schema nur per sanfter Migration / `CREATE TABLE IF NOT EXISTS`.
- JSON bleibt Fallback, nicht primäre Bearbeitungsoberfläche fuer dashboardfaehige Texte.
- Vor Hug/SoundAlert-Umbauten zuerst echte Tabellen, Helper und Dashboard-Routen prüfen.

## STEP252 DeathCounter DB-Storage-Vorbereitung

DeathCounter V2 nutzt produktiv weiterhin `data/deathcounter/deathcounter.v2.json`. STEP252 legt nur die spätere DB-Storage-Grundlage an.

Vorbereitete Tabellen:

|Tabelle|Zweck|Produktiv aktiv|
|---|---|---|
|deathcounter_players|spätere Spieler-Stammdaten|nein|
|deathcounter_games|spätere Game-Stammdaten|nein|
|deathcounter_counts|spätere Count-Werte pro Spieler/Game|nein|
|deathcounter_overlay_state|späterer Overlay-State|nein|
|deathcounter_events|spätere Event-/Audit-Grundlage|nein|

Schema-Version:

```text
schema_versions.module_name = deathcounter_v2_storage
version = 1
```

Regeln bleiben:

```text
- app.sqlite niemals ersetzen
- nur CREATE TABLE IF NOT EXISTS / sanfte Migration
- keine Count-Migration ohne gesonderten Step
- keine produktive Umstellung ohne gesonderten Step
```


## STEP253 DeathCounter Storage-Preview

Neue Read-only-Route:

```text
GET /api/deathcounter/v2/storage/preview
```

Zweck:

```text
JSON-State lesen -> geplante DB-Zeilen im Speicher anzeigen -> nichts schreiben
```

Sicherheitsstatus der Route:

```text
readOnly: true
writesDatabase: false
importsCounts: false
switchesStorage: false
activeStorage: json_state_file
preparedStorage: database_schema
```

Die Vorschau umfasst:

|Preview-Bereich|Zieltabelle|Schreibt produktiv?|
|---|---|---|
|players|deathcounter_players|nein|
|games|deathcounter_games|nein|
|counts|deathcounter_counts|nein|
|overlayState|deathcounter_overlay_state|nein|
|events|deathcounter_events|nein|

`deathcounter_events` bleibt leer, weil historische Events aus dem JSON-State nicht sicher rekonstruierbar sind.

## DeathCounter V2 - vorbereitete Storage-/Validation-Struktur

Seit STEP252/253/254 vorbereitet; seit STEP255 mit geschuetztem Import-Endpunkt, aber weiterhin nicht als produktiver Storage aktiv:

```text
Schema-Modul: deathcounter_v2_storage
Aktiver Storage: json_state_file
Vorbereiteter Storage: database_schema
Read-only Preview: GET /api/deathcounter/v2/storage/preview
Read-only Validation: GET /api/deathcounter/v2/storage/validate
Guarded Import: POST /api/deathcounter/v2/storage/import
```

Vorbereitete Tabellen:

```text
deathcounter_players
deathcounter_games
deathcounter_counts
deathcounter_overlay_state
deathcounter_events
```

Wichtig: STEP255 kann nach explizitem Confirm Daten aus dem JSON-State in die vorbereiteten DB-Tabellen schreiben. Die produktive Logik bleibt trotzdem auf `data/deathcounter/deathcounter.v2.json`; ein Storage-Wechsel braucht einen eigenen STEP.
