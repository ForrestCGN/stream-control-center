# Todo-Modul - Deep Dive

Stand: 2026-05-26  
Quelle: Analyse des Uploads `backend.zip` / Datei `backend/modules/todo.js`.  
STEP: `STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE`

## Zweck

Chat-/Discord-ToDo-System mit Zielbereichen, Discord-Channel-Zuordnung, Userauflösung, Statistik, DB-/JSON-Settings und Textverwaltung.

## Datei

- `backend/modules/todo.js`

## Erkannte API-Routen

| Methode | Pfad |
|---|---|
| `GET` | `/discord/todo/status` |
| `GET` | `/api/todo/status` |
| `GET` | `/api/todo/config` |
| `GET` | `/api/todo/settings` |
| `GET` | `/api/todo/routes` |
| `GET` | `/api/todo/integration-check` |
| `GET` | `/discord/todo` |
| `GET` | `/api/todo/add` |
| `POST` | `/discord/todo` |
| `POST` | `/api/todo/add` |
| `GET` | `/api/todo/stats` |
| `GET` | `/api/todo/stats/top` |
| `GET` | `/api/todo/stats/today` |
| `GET` | `/api/todo/admin/settings` |
| `POST` | `/api/todo/admin/settings` |
| `GET` | `/api/todo/admin/texts` |
| `POST` | `/api/todo/admin/texts` |
| `GET` | `/api/todo/reload` |
| `POST` | `/api/todo/reload` |

## Erkannte Hauptfunktionen / interne Bereiche

- `fetchJsonWithTimeout`
- `resolveAuthorInfo`
- `postTodoEntry`
- `deepClone`
- `deepMerge`
- `flattenSettingsObject`
- `setNestedValue`
- `normalizeTargets`
- `getTargets`
- `loadDbSettings`
- `loadDbMessages`
- `publicSettings`
- `getAdminPayload`
- `listAdminSettings`
- `setAdminSettings`
- `textEditorOptions`
- `listAdminTexts`
- `setAdminTexts`
- `normalizeAlias`
- `getInput`
- `wantsPlain`
- `reply`
- `readJsonSafe`
- `ensureMessagesFile`
- `loadRuntime`
- `t`
- `nowIso`
- `localDateString`
- `checkAuth`
- `getDiscordBridge`
- `getNestedValue`
- `extractDisplayNameFromUserinfo`
- `shouldResolveDisplayName`
- `parseTodoMessage`
- `resolveTodoTarget`
- `getTargetListText`
- `getTodoChannelIdForTarget`
- `getChannelStatus`
- `makeUserKey`
- `ensureTodoSchema`
- `incrementStats`
- `formatStatsRows`
- `getLimit`
- `buildStatus`
- `countTableRows`
- `fileCheck`
- `buildTodoRoutes`
- `safeCall`
- `buildTodoIntegrationCheck`
- `handleConfig`
- `handleSettings`
- `handleRoutes`
- `handleIntegrationCheck`
- `init`
- `addHandler`
- `reloadHandler`

## Erkannte Datenbanktabellen

- `todo_user_stats`
- `todo_daily_stats`

## Wichtige Abhängigkeiten

- `Discord-Modul/Bridge`
- `Twitch-Userinfo für DisplayName`
- `SQLite Stats-Tabellen`
- `config/messages/todo.json bzw. Texthelper`
- `config/discord_channels.json`

## Runtime-/State-Themen

- Das Modul wird über `backend/server.js`/Modul-Initialisierung geladen.
- Status-/Config-/Routes-/Integration-Check-Routen sind, soweit vorhanden, als primäre Diagnosepunkte zu verwenden.
- Echte Runtime-Werte müssen am Live-System über die Statusrouten geprüft werden; diese Doku beschreibt den aus Dateien erkennbaren Stand.

## Dashboard-/Overlay-Anbindung

- Dashboard-Dateien waren in diesem Upload nicht vollständig enthalten. Deshalb ist die Dashboard-Anbindung hier nur aus Backend-Routen ableitbar.
- Vor UI-Änderungen müssen die echten Dateien unter `htdocs/dashboard/` geprüft werden.
- Vor Overlay-Änderungen müssen die echten Dateien unter `htdocs/overlays/` geprüft werden.

## Risiken / Regeln

- `/api/todo/add und /discord/todo erzeugen echte ToDo-Posts.`
- `Target-/Channel-Mapping muss sauber dokumentiert bleiben.`

## Sinnvolle Tests

- `GET /api/todo/status`
- `GET /api/todo/config`
- `GET /api/todo/stats`
- `GET /api/todo/integration-check`

## Offene Punkte

- Modul-Doku nach jedem funktionalen STEP aktualisieren.
- Dashboard-Dateien beim nächsten passenden UI-STEP ergänzend dokumentieren.
- Config-/Message-Dateien aus dem echten Repo/Live-Stand gegen diese Doku gegenprüfen.
