# Clip-Shoutout / VSO Deep Dive

> Stand: 2026-05-26 / STEP483_SHOUTOUT_DASHBOARD_TABS. Quelle: GitHub/dev-Prüfung von `backend/modules/clip_shoutout.js`, `htdocs/dashboard/modules/shoutout.js` und `htdocs/dashboard/modules/shoutout.css`. Vor weiteren Codeänderungen weiterhin die echte Datei aus GitHub/dev oder Live vollständig prüfen.

## Zweck

`backend/modules/clip_shoutout.js` steuert das Video-/Clip-Shoutout-System. Es nimmt Chat-/API-Anfragen an, löst Zielkanäle auf, sucht Clips, verwaltet Display-Queue und Official-Twitch-Shoutout-Queue, führt Streamtag-Limits und Statistiken und schreibt Timeline-/Queue-Daten in SQLite.

Das Dashboard-Modul `htdocs/dashboard/modules/shoutout.js` zeigt diese Daten im Control-Center an. Ab STEP483 ist die UI in Tabs/Unterbereiche aufgeteilt, damit die Seite nicht mehr alle großen Tabellen gleichzeitig auf einer langen Seite anzeigt.

## Datei und Version

| Punkt | Wert |
|---|---|
| Backend-Moduldatei | `backend/modules/clip_shoutout.js` |
| erkannte Modulversion | `0.2.10` |
| API-Prefix | `/api/clip-shoutout` |
| Legacy-API | `/api/clip/shoutout` |
| Dashboard-JS | `htdocs/dashboard/modules/shoutout.js` |
| Dashboard-CSS | `htdocs/dashboard/modules/shoutout.css` |
| Dashboard-Panel | `htdocs/dashboard/index.html` -> `#shoutoutModule` |
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

## Dashboard-Tabs ab STEP483

| Tab | Inhalt |
|---|---|
| Übersicht | Kurzstatus, kompakte Statistik und letzte Timeline-Einträge |
| Queues | Display-Queue und Official-Queue mit Retry/Remove-Aktionen |
| Statistik | Ziel-/Auslöser-/Paar-Statistik mit vorhandenen Filtern |
| Timeline | vollständige Timeline-Tabelle |
| Settings/Test | Testauslösung, Official Live-Gate und kompakte Settings-Anzeige |

Wichtig: STEP483 ändert keine Backend-Logik, keine Routen, keine Datenbanktabellen und keine produktive Shoutout-Ablaufsteuerung. Die vorhandenen Dashboard-Aktionen bleiben erhalten.

## Hauptfunktionen / interne Bereiche

Backend:

- Config: `loadConfig`, `shoutoutConfig`, `saveShoutoutConfig`, `displayConfig`, `streamDayLimitConfig`.
- Streamtag: `readCurrentStreamState`, `normalizeCentralStreamStatus`, `resolveCurrentStreamDay`.
- Display-Queue: `ensureDisplayQueueSchema`, `processDisplayQueue`, `runDisplayJob`, Queue-Listen/Retry/Remove.
- Official Twitch Shoutout: `ensureOfficialShoutoutSchema`, `sendOfficialTwitchShoutout`, `processOfficialShoutoutQueue`, History/Queue.
- Twitch/Clip-Auflösung: `getAppAccessToken`, `helixGet`, `listClipsForBroadcaster`, `lookupUserViaHelix`, `lookupUserViaLocalUserinfo`, `resolveTargetUser`, `resolveClipPlaybackUrl`.
- Clip-Vorbereitung: `downloadClipToSoundAssets`, `prepareClipPlayback`.
- Chat/EventBus: `sendChatMessage`, `getCommunicationBus`, `emitShoutoutBus`.

Dashboard:

- `registerDashboardModule` meldet `shoutout` im Dashboard an.
- `loadAll` lädt Status, Queue, Timeline, Statistik und Stream-Status.
- `renderHero` zeigt die oberen Kernmetriken.
- `renderTabs` erzeugt die neuen Unterbereiche.
- `renderOverview`, `renderQueues`, `renderStats`, `renderTimeline`, `renderSettingsTest` bauen die einzelnen Tab-Inhalte.
- `postAction` nutzt bestehende Retry-/Remove-Routen.
- `runTest` nutzt weiterhin `POST /api/clip-shoutout/run`.

## Runtime-Status / Variablen

- Display-Queue-Status: `queued`, `waiting`, `active`, `done`, `failed`.
- Official-Queue-Status: `queued`, `waiting`, `sent`, `failed`.
- Streamtag-Status: `active`, `grace`, `ended`.
- Cooldowns: Display-Abstand, Official-Global-Cooldown, Official-Target-Cooldown.
- Override: Force-/Override-Parameter können Streamtag-/Cooldown-Regeln gezielt übersteuern.
- Dashboard-State ab STEP483 zusätzlich: `activeTab` mit Standard `overview`.

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
- Dashboard lädt über Backend-APIs und greift nicht direkt auf SQLite oder Config-Dateien zu.

## EventBus / Monitoring

- Backend enthält weiterhin EventBus-Bezug über `communication_bus` und `emitShoutoutBus`.
- STEP483 ergänzt keine neuen EventBus-Events.
- Spätere EventBus-/Monitoring-Erweiterung soll Status, Queue-Zustände, Fehler und Modulversionen melden, ohne produktive Flows ungeprüft auf Bus-First umzustellen.

## Tests

Syntax:

```bat
node --check htdocs\dashboard\modules\shoutout.js
```

API-/Live-Checks:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/timeline"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/stats"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/official/auth-status"
```

Dashboard-Test:

```text
/dashboard/ öffnen -> Shoutout-System -> Tabs Übersicht, Queues, Statistik, Timeline, Settings/Test prüfen.
```

## Offene Punkte

- Eingehende Shoutouts separat loggen und statistisch anzeigen.
- Produktive Umstellung auf `!so` nur ausdrücklich und nach Prüfung.
- Settings-Bearbeitung im Dashboard später sauber planen, falls gewünscht. STEP483 zeigt Settings nur kompakt an und speichert nichts.
