# Messages Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/messages.js` aus dem aktuellen Backend-Upload.  
Kategorie: `chat-control`

## Zweck

Messages-System für Status/Config/Random/Send/Scheduler und Legacy-Routen.

## Datei

```text
backend/modules/messages.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `init`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/messages/status` |
| `GET` | `/messages/config` |
| `GET` | `/messages/settings` |
| `GET` | `/messages/routes` |
| `GET` | `/messages/integration-check` |
| `GET` | `/messages/reload` |
| `POST` | `/messages/reload` |
| `GET` | `/messages/random` |
| `POST` | `/messages/random` |
| `GET` | `/messages/send` |
| `POST` | `/messages/send` |
| `POST` | `/messages/scheduler/start` |
| `POST` | `/messages/scheduler/stop` |
| `GET` | `/messages/scheduler/status` |
| `GET` | `/api/messages/status` |
| `GET` | `/api/messages/config` |
| `GET` | `/api/messages/settings` |
| `GET` | `/api/messages/routes` |
| `GET` | `/api/messages/integration-check` |
| `POST` | `/api/messages/reload` |
| `GET` | `/api/messages/reload` |
| `GET` | `/api/messages/random` |
| `POST` | `/api/messages/random` |
| `GET` | `/api/messages/render` |
| `POST` | `/api/messages/render` |
| `GET` | `/api/messages/send` |
| `POST` | `/api/messages/send` |
| `POST` | `/api/messages/scheduler/start` |
| `POST` | `/api/messages/scheduler/stop` |
| `GET` | `/api/messages/scheduler/status` |
| `GET` | `/messages/render` |
| `POST` | `/messages/render` |

## erkannte Hauptfunktionen / interne Bereiche

- `add`
- `buildAndMaybeSend`
- `buildMessagesConfig`
- `buildMessagesIntegrationCheck`
- `buildMessagesRoutes`
- `buildMessagesSettings`
- `buildOptions`
- `checkAuth`
- `checkCooldown`
- `collectContext`
- `cooldownKey`
- `countStatusCollection`
- `extractPossiblePaths`
- `fileCheck`
- `getInput`
- `getMessagesStatusSafe`
- `handleConfig`
- `handleIntegrationCheck`
- `handleRoutes`
- `handleSettings`
- `init`
- `randomHandler`
- `reloadHandler`
- `reply`
- `safeCall`
- `schedulerStartHandler`
- `schedulerStatus`
- `schedulerStopHandler`
- `sendDiscordIfRequested`
- `startScheduler`
- `stopScheduler`
- `wantsPlain`

## erkannte Datenbanktabellen

- Keine Datenbanktabellen per SQL-/Konstanten-Analyse erkannt.

## erkannte Config-/Runtime-Dateien

- Keine konkreten Config-/Runtime-Dateien eindeutig erkannt.

## interne Abhängigkeiten

- `./helpers/helper_core`
- `./helpers/helper_messages`
- `./helpers/helper_routes`
- `./helpers/helper_security`
- `./helpers/helper_texts`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Mit message_rotator und message_rotator_scheduler abgleichen, damit keine Doppelzuständigkeit entsteht.
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
