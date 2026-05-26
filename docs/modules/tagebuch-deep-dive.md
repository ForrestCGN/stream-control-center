# Tagebuch-Modul - Deep Dive

Stand: 2026-05-26  
Quelle: Analyse des Uploads `backend.zip` / Datei `backend/modules/tagebuch.js`.  
STEP: `STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE`

## Zweck

Streamtagebuch: sammelt Chat-/Systemeinträge, verwaltet Streamstart/-ende, Seiten-/Tagesstatus, Discord-Ausgabe, DB-Settings und Textvarianten.

## Datei

- `backend/modules/tagebuch.js`

## Erkannte API-Routen

| Methode | Pfad |
|---|---|
| `GET` | `/api/tagebuch/status` |
| `GET` | `/api/tagebuch/config` |
| `GET` | `/api/tagebuch/settings` |
| `GET` | `/api/tagebuch/routes` |
| `GET` | `/api/tagebuch/integration-check` |
| `POST` | `/api/tagebuch/reload` |
| `GET` | `/api/tagebuch/reload` |
| `POST` | `/api/tagebuch/stream/start` |
| `GET` | `/api/tagebuch/stream/start` |
| `POST` | `/api/tagebuch/stream/end` |
| `GET` | `/api/tagebuch/stream/end` |
| `POST` | `/api/tagebuch/entry` |
| `GET` | `/api/tagebuch/entry` |
| `POST` | `/api/tagebuch/reset` |
| `GET` | `/api/tagebuch/reset` |
| `GET` | `/api/tagebuch/stats` |
| `GET` | `/api/tagebuch/stats/top` |
| `GET` | `/api/tagebuch/stats/today` |
| `GET` | `/api/tagebuch/stats/user` |
| `GET` | `/api/tagebuch/admin/settings` |
| `POST` | `/api/tagebuch/admin/settings` |
| `GET` | `/api/tagebuch/admin/texts` |
| `POST` | `/api/tagebuch/admin/texts` |
| `POST` | `/discord/stream/start` |
| `GET` | `/discord/stream/start` |
| `POST` | `/discord/stream/end` |
| `GET` | `/discord/stream/end` |
| `POST` | `/discord/tagebuch` |
| `GET` | `/discord/tagebuch` |
| `GET` | `/discord/tagebuch/status` |
| `POST` | `/discord/tagebuch/reset` |
| `GET` | `/discord/tagebuch/reset` |

## Erkannte Hauptfunktionen / interne Bereiche

- `resolveTwitchUser`
- `postWebhook`
- `createPageForDateIfNeeded`
- `markStreamStarted`
- `postDiaryEntry`
- `markStreamEnded`
- `handleStreamStart`
- `handleStreamEnd`
- `handleTagebuch`
- `nowIso`
- `safeString`
- `boolValue`
- `deepMerge`
- `flattenSettingsObject`
- `setNestedValue`
- `applyDbSettings`
- `applyDbMessages`
- `safePublicConfig`
- `getAdminPayload`
- `listAdminSettings`
- `setAdminSettings`
- `textEditorOptions`
- `listAdminTexts`
- `setAdminTexts`
- `readJsonIfExists`
- `writeJsonIfMissing`
- `configPath`
- `messagesPath`
- `loadRuntimeConfig`
- `loadRuntimeMessages`
- `getConfig`
- `getMessages`
- `reloadRuntime`
- `localDateString`
- `stripTagebuchCommand`
- `getInput`
- `wantsPlain`
- `authOk`
- `jsonForbidden`
- `buildPageTitle`
- `ensureSchema`
- `getState`
- `saveState`
- `logRuntimeEvent`
- `getBridge`
- `normalizeUserKey`
- `updateUserStats`
- `statsLimit`
- `mapUserStatsRow`
- `mapDailyStatsRow`
- `getStatsTop`
- `getStatsForDate`
- `getStatsForUser`
- `resetState`
- `nextPageNumberIfNewDate`
- `publicState`
- `buildStatus`
- `countTableRows`
- `fileCheck`
- `buildTagebuchRoutes`
- `buildTagebuchIntegrationCheck`
- `sendPlainOrJson`
- `registerRoutes`
- `handleStatus`
- `handleConfig`
- `handleSettings`
- `handleRoutes`
- `handleIntegrationCheck`
- `handleStatsTop`
- `handleStatsToday`

## Erkannte Datenbanktabellen

- `tagebuch_state`
- `tagebuch_state_new`
- `tagebuch_runtime_events`
- `tagebuch_user_stats`
- `tagebuch_daily_user_stats`

## Wichtige Abhängigkeiten

- `Discord-Modul/Bridge`
- `Twitch-Userauflösung`
- `SQLite Tabellen für Status/Events/Stats`
- `config/tagebuch.json`
- `config/messages/tagebuch.json`
- `Stream-Status perspektivisch`

## Runtime-/State-Themen

- Das Modul wird über `backend/server.js`/Modul-Initialisierung geladen.
- Status-/Config-/Routes-/Integration-Check-Routen sind, soweit vorhanden, als primäre Diagnosepunkte zu verwenden.
- Echte Runtime-Werte müssen am Live-System über die Statusrouten geprüft werden; diese Doku beschreibt den aus Dateien erkennbaren Stand.

## Dashboard-/Overlay-Anbindung

- Dashboard-Dateien waren in diesem Upload nicht vollständig enthalten. Deshalb ist die Dashboard-Anbindung hier nur aus Backend-Routen ableitbar.
- Vor UI-Änderungen müssen die echten Dateien unter `htdocs/dashboard/` geprüft werden.
- Vor Overlay-Änderungen müssen die echten Dateien unter `htdocs/overlays/` geprüft werden.

## Risiken / Regeln

- `Stream-Ende und Reset ändern produktiven Tagebuchstatus.`
- `Einträge können Discord-Ausgaben erzeugen.`
- `DB-Settings und JSON-Fallback müssen synchron nachvollziehbar bleiben.`

## Sinnvolle Tests

- `GET /api/tagebuch/status`
- `GET /api/tagebuch/config`
- `GET /api/tagebuch/stats`
- `GET /api/tagebuch/integration-check`

## Offene Punkte

- Modul-Doku nach jedem funktionalen STEP aktualisieren.
- Dashboard-Dateien beim nächsten passenden UI-STEP ergänzend dokumentieren.
- Config-/Message-Dateien aus dem echten Repo/Live-Stand gegen diese Doku gegenprüfen.
