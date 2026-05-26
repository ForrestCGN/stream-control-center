# Message Rotator Scheduler Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/message_rotator_scheduler.js` aus dem aktuellen Backend-Upload.  
Kategorie: `chat-control`

## Zweck

Scheduler-Ergänzung für Message-Rotator mit Settings, Start/Stop/Run und DB-Settings.

## Datei

```text
backend/modules/message_rotator_scheduler.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `init`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/message-rotator/scheduler/status` |
| `GET` | `/api/message-rotator/scheduler/routes` |
| `GET` | `/api/message-rotator/scheduler/settings` |
| `POST` | `/api/message-rotator/scheduler/settings` |
| `GET` | `/api/message-rotator/scheduler/reload` |
| `POST` | `/api/message-rotator/scheduler/reload` |
| `GET` | `/api/message-rotator/scheduler/start` |
| `POST` | `/api/message-rotator/scheduler/start` |
| `GET` | `/api/message-rotator/scheduler/stop` |
| `POST` | `/api/message-rotator/scheduler/stop` |
| `GET` | `/api/message-rotator/scheduler/run` |
| `POST` | `/api/message-rotator/scheduler/run` |
| `GET/POST` | `/api/message-rotator/scheduler/reload` |
| `GET/POST` | `/api/message-rotator/scheduler/start` |
| `GET/POST` | `/api/message-rotator/scheduler/stop` |
| `GET/POST` | `/api/message-rotator/scheduler/run` |

## erkannte Hauptfunktionen / interne Bereiche

- `applyDbSettings`
- `buildUrl`
- `checkAuth`
- `cleanString`
- `clone`
- `flattenSettingsObject`
- `getAdminPayload`
- `getConfig`
- `guarded`
- `init`
- `listAdminSettings`
- `loadConfig`
- `normalizeConfig`
- `positiveInt`
- `publicState`
- `requestJson`
- `restartScheduler`
- `routeHandler`
- `routesPayload`
- `sanitizeResult`
- `schedulerRun`
- `setAdminSettings`
- `setNestedValue`
- `startScheduler`
- `stopScheduler`
- `toBool`

## erkannte Datenbanktabellen

- `message_rotator_scheduler_settings`

## erkannte Config-/Runtime-Dateien

- `message_rotator_scheduler.json`

## interne Abhängigkeiten

- `./helpers/helper_config`
- `./helpers/helper_core`
- `./helpers/helper_routes`
- `./helpers/helper_security`
- `./helpers/helper_settings`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Doppelung mit message_rotator.js bewusst dokumentieren und später sauber zusammenführen/abgrenzen.
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
