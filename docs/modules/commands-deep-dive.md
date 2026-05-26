# Commands-System Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/commands.js` aus dem aktuellen Backend-Upload.  
Kategorie: `chat-control`

## Zweck

Zentrales Command-System für definierbare Chatcommands, Ausführung, Cooldowns, Permissions und Logs.

## Datei

```text
backend/modules/commands.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `module.exports = ...`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/commands/status` |
| `GET` | `/api/commands/list` |
| `GET` | `/api/commands/catalog` |
| `POST` | `/api/commands/upsert` |
| `POST` | `/api/commands/delete` |
| `GET` | `/api/commands/test` |
| `POST` | `/api/commands/test` |
| `GET` | `/api/commands/execute` |
| `POST` | `/api/commands/execute` |
| `GET` | `/api/commands/logs` |
| `GET` | `/api/commands/history` |
| `GET/POST` | `/api/commands/test` |
| `GET/POST` | `/api/commands/execute` |

## erkannte Hauptfunktionen / interne Bereiche

- `bool`
- `buildCommandCatalog`
- `buildRoutes`
- `buildTargetPayload`
- `checkCooldown`
- `cleanLogin`
- `cleanText`
- `cleanTrigger`
- `cooldownKey`
- `deleteCommand`
- `ensureSchema`
- `executeCommand`
- `getCommandByTrigger`
- `handleChatMessage`
- `handleExecute`
- `handleLogs`
- `handleTest`
- `hasPermission`
- `httpJsonRequest`
- `init`
- `int`
- `jsonDecode`
- `jsonEncode`
- `listCommands`
- `logExecution`
- `markCooldown`
- `normalizeAliases`
- `normalizeConfig`
- `nowIso`
- `parseChatMessage`
- `processMessage`
- `readMessageFromReq`
- `readUserFromReq`
- `recentLogs`
- `rowToCommand`
- `safeJsonEncode`
- `saveCommand`
- `seedDefaultCommands`
- `statusPayload`
- `summarizeResultForLog`
- `upsertCommand`
- `userFromParsed`

## erkannte Datenbanktabellen

- `command_definitions`
- `command_execution_log`

## erkannte Config-/Runtime-Dateien

- Keine konkreten Config-/Runtime-Dateien eindeutig erkannt.

## interne Abhängigkeiten

- `../core/database`
- `./helpers/helper_core`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Neue Commands bevorzugt über dieses System integrieren, nicht als verstreute Einzelrouten.
- Keine Funktionalität entfernen.
- Keine Secrets, Tokens, `.env`, Datenbanken oder Backups committen.
- Dashboard-Zugriff immer über Backend-APIs, nicht direkt auf SQLite oder Dateien.
- Bei unklarer Live-Abweichung zuerst echte Datei aus `D:\Git\stream-control-center` oder `D:\Streaming\stramAssets` prüfen.

## Sinnvolle Tests

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/_status"
$s.modules | Select-Object name,ok,enabled,moduleVersion,lastError
```

Zusätzlich je nach Modul die oben gelisteten Status-/Routes-/Integration-Check-Routen im Browser oder per `Invoke-RestMethod` prüfen.

## Offene Punkte

- Modul bei nächster Facharbeit gegen Live-Repo prüfen, nicht nur gegen ZIP-Stand.
- Fehlende Versionskennung nach Möglichkeit später ergänzen, ohne Runtime-Verhalten zu ändern.
- Wenn Dashboard-Anbindung existiert: Dashboard-Dateien separat dokumentieren und mit API-Routen abgleichen.
