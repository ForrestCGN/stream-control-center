# Clip-Shoutout / VSO Deep Dive

> Stand: 2026-05-26 / STEP477. Quelle: aktueller Upload `backend.zip`. Vor Codeänderungen weiterhin die echte Datei aus GitHub/dev oder Live vollständig prüfen.

## Zweck

`backend/modules/clip_shoutout.js` steuert das Video-/Clip-Shoutout-System. Es nimmt Chat-/API-Anfragen an, löst Zielkanäle auf, sucht Clips, verwaltet Display-Queue und Official-Twitch-Shoutout-Queue, führt Streamtag-Limits und Statistiken und schreibt Timeline-/Queue-Daten in SQLite.

## Datei und Version

| Punkt | Wert |
|---|---|
| Moduldatei | `backend/modules/clip_shoutout.js` |
| erkannte Modulversion | `0.2.10` |
| API-Prefix | `/api/clip-shoutout` |
| Legacy-API | `/api/clip/shoutout` |
| Command-Integration | `command_definitions`, Trigger im Modul standardmäßig `so`/VSO-Kontext |

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/clip-shoutout/status` |
| `GET` | `/api/clip-shoutout/clips` |
| `GET` | `/api/clip-shoutout/run` |
| `POST` | `/api/clip-shoutout/run` |
| `GET` | `/api/clip/shoutout` |
| `POST` | `/api/clip/shoutout` |
| `GET` | `/api/clip-shoutout/settings` |
| `POST` | `/api/clip-shoutout/settings` |
| `GET` | `/api/clip-shoutout/queue` |
| `GET` | `/api/clip-shoutout/timeline` |
| `GET` | `/api/clip-shoutout/stats` |
| `GET` | `/api/clip-shoutout/stats/user` |
| `POST` | `/api/clip-shoutout/display-queue/remove` |
| `POST` | `/api/clip-shoutout/display-queue/retry` |
| `POST` | `/api/clip-shoutout/queue/remove` |
| `POST` | `/api/clip-shoutout/queue/retry` |
| `GET` | `/api/clip-shoutout/official/auth-status` |

## Hauptfunktionen / interne Bereiche

- Config: `loadConfig`, `shoutoutConfig`, `saveShoutoutConfig`, `displayConfig`, `streamDayLimitConfig`.
- Streamtag: `readCurrentStreamState`, `normalizeCentralStreamStatus`, `resolveCurrentStreamDay`.
- Display-Queue: `ensureDisplayQueueSchema`, `processDisplayQueue`, `runDisplayJob`, Queue-Listen/Retry/Remove.
- Official Twitch Shoutout: `ensureOfficialShoutoutSchema`, `sendOfficialTwitchShoutout`, `processOfficialShoutoutQueue`, History/Queue.
- Twitch/Clip-Auflösung: `getAppAccessToken`, `helixGet`, `listClipsForBroadcaster`, `lookupUserViaHelix`, `lookupUserViaLocalUserinfo`, `resolveTargetUser`, `resolveClipPlaybackUrl`.
- Clip-Vorbereitung: `downloadClipToSoundAssets`, `prepareClipPlayback`.
- Chat/EventBus: `sendChatMessage`, `getCommunicationBus`, `emitShoutoutBus`.

## Runtime-Status / Variablen

- Display-Queue-Status: `queued`, `waiting`, `active`, `done`, `failed`.
- Official-Queue-Status: `queued`, `waiting`, `sent`, `failed`.
- Streamtag-Status: `active`, `grace`, `ended`.
- Cooldowns: Display-Abstand, Official-Global-Cooldown, Official-Target-Cooldown.
- Override: Force-/Override-Parameter können Streamtag-/Cooldown-Regeln gezielt übersteuern.

## Datenbanktabellen

| Tabelle | Zweck | Wichtige Spalten |
|---|---|---|
| `clip_shoutout_stream_days` | Streamtag-/Session-Zuordnung | `stream_day_id`, `broadcaster_login`, `status`, `stream_id`, `stream_started_at`, `restart_grace_until`, `source`, `meta_json` |
| `clip_shoutout_display_queue` | Anzeige-Queue | `target_login`, `target_display`, `requested_by_login`, `status`, `available_at`, `started_at`, `finished_at`, `stream_day_id`, `override_used`, `input_json`, `meta_json` |
| `clip_shoutout_official_queue` | Queue für offiziellen Twitch-Shoutout | `target_login`, `target_user_id`, `display_queue_id`, `status`, `available_at`, `sent_at`, `last_error`, `meta_json` |
| `clip_shoutout_official_history` | Verlauf offizieller Twitch-Shoutouts | `target_login`, `target_user_id`, `queue_id`, `display_queue_id`, `result`, `error`, `sent_at`, `meta_json` |
| `command_definitions` | Command-Registrierung | `trigger`, `aliases_json`, `module_key`, `target_method`, `target_url`, `permission_level`, `cooldown_*`, `config_json` |

## Config / Dateien

- erkannte Config-Datei: `config/clip_system.json`.
- Streamtag-Logik soll zentral `stream_status` nutzen.
- Clips/Sound-Assets hängen am Sound-/Assets-Kontext.

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/timeline"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/stats"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/official/auth-status"
```

## Offene Punkte

- Shoutout-Dashboard in Tabs/Unterbereiche aufteilen.
- Eingehende Shoutouts separat loggen und statistisch anzeigen.
- Produktive Umstellung auf `!so` nur ausdrücklich und nach Prüfung.
