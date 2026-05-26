# Challenge-System Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/challenge.js` aus dem aktuellen Backend-Upload.  
Kategorie: `community-runtime`

## Zweck

Kanalpunkte-/Challenge-Laufzeitmodul mit aktiver Challenge, Queue und Statistik. Muss bei Änderungen besonders auf Timer, Queue und Overlay-State geprüft werden.

## Datei

```text
backend/modules/challenge.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `module.exports = ...`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/challenge` |
| `POST` | `/api/challenge` |
| `GET` | `/scripts/challenge` |
| `POST` | `/scripts/challenge` |
| `GET` | `/api/challenge/start` |
| `POST` | `/api/challenge/start` |
| `GET` | `/api/challenge/status` |
| `POST` | `/api/challenge/status` |
| `GET` | `/api/challenge/remove-next` |
| `POST` | `/api/challenge/remove-next` |
| `GET` | `/api/challenge/remove` |
| `POST` | `/api/challenge/remove` |
| `GET` | `/api/challenge/reset` |
| `POST` | `/api/challenge/reset` |
| `GET` | `/api/challenge/reload` |
| `POST` | `/api/challenge/reload` |
| `GET` | `/api/challenge/config` |
| `GET` | `/api/challenge/settings` |
| `GET` | `/api/challenge/routes` |
| `GET` | `/api/challenge/integration-check` |
| `GET` | `/api/challenge/stats` |
| `POST` | `/api/challenge/stats` |
| `GET` | `/api/challenge/stats/top` |
| `GET` | `/api/challenge/stats/user` |
| `GET/POST` | `${p}/start` |
| `GET/POST` | `${p}/status` |
| `GET/POST` | `${p}/remove-next` |
| `GET/POST` | `${p}/remove` |
| `GET/POST` | `${p}/reset` |
| `GET/POST` | `${p}/reload` |
| `GET/POST` | `${p}/stats` |
| `GET` | `${p}/stats/top` |
| `GET` | `${p}/stats/user` |
| `GET` | `${p}/config` |
| `GET` | `${p}/settings` |
| `GET` | `${p}/routes` |
| `GET` | `${p}/integration-check` |
| `GET/POST` | `/scripts/challenge` |

## erkannte Hauptfunktionen / interne Bereiche

- `broadcast`
- `broadcastChallengeStarted`
- `broadcastStatus`
- `buildChallengeLegacyRoutes`
- `buildChallengeRoutes`
- `buildRoutesResponse`
- `cleanUser`
- `clearNextStartTimer`
- `clone`
- `createEntry`
- `dbAll`
- `dbGet`
- `dbRun`
- `ensureStatsSchema`
- `fileStatus`
- `fileStatusFromRelative`
- `finishActive`
- `formatDuration`
- `getChatBool`
- `getDelayBetweenChallengesMs`
- `getParam`
- `getStatsEnabled`
- `handleConfig`
- `handleIntegrationCheck`
- `handleReload`
- `handleRemoveNext`
- `handleReset`
- `handleRoutes`
- `handleSettings`
- `handleStart`
- `handleStats`
- `handleStatsTop`
- `handleStatsUser`
- `handleStatus`
- `init`
- `isDatabaseReady`
- `loadJsonFromConfig`
- `loadRuntime`
- `mergeDefaults`
- `normalizeMode`
- `normalizeUserKey`
- `pickMessage`
- `placeholders`
- `playDiscordSoundFor`
- `positiveInt`
- `publicChallenge`
- `recordChallengeStat`
- `registerGet`
- `registerPost`
- `render`
- `respond`
- `sanitizeConfig`
- `scheduleNextFromQueue`
- `sendTwitchChatMessage`
- `snapshot`

## erkannte Datenbanktabellen

- `challenge_runtime_events`
- `challenge_user_mode_stats`

## erkannte Config-/Runtime-Dateien

- `/assets/sounds/nichtfluchen.mp3`
- `/assets/sounds/nichtreden.mp3`
- `_overlay-challenge_status.html`
- `challenge.json`
- `challenge_system.json`
- `config\\challenge_system.json`
- `config\\messages\\challenge.json`

## interne Abhängigkeiten

- `../core/database`
- `./helpers/helper_config`
- `./helpers/helper_core`
- `./helpers/helper_messages`
- `./helpers/helper_routes`
- `./twitch_presence`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Keine parallele Timer-Logik in Streamer.bot aufbauen, wenn Node bereits Zustand und Laufzeit verwaltet.
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
