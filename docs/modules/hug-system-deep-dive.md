# Hug System Legacy/Runtime Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/hug_system.js` aus dem aktuellen Backend-Upload.  
Kategorie: `community-runtime`

## Zweck

Älteres/zusätzliches Hug-System-Modul mit eigenen Routen und Tabellen neben hug.js.

## Datei

```text
backend/modules/hug_system.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `init`

## API-Routen

| Methode | Route |
|---|---|
| `POST` | `/hug/action` |
| `POST` | `/hug/stats` |
| `GET` | `/hug/cmd` |
| `GET` | `/hug/statscmd` |
| `GET` | `/hug/top` |
| `GET` | `/hug/reload` |

## erkannte Hauptfunktionen / interne Bereiche

- `buildStatsMessage`
- `cleanupExpiredPendingForTarget`
- `cleanupExpiredPendingGlobal`
- `createUserIdentityMismatchError`
- `deepMerge`
- `ensureDir`
- `ensureHugUser`
- `ensurePairRow`
- `ensureSchema`
- `executeAction`
- `formatTemplate`
- `getRehugWindowMinutes`
- `getStatsByUserId`
- `getTypeById`
- `getUserEnabled`
- `handleAction`
- `handleCmd`
- `handleReload`
- `handleStats`
- `handleStatsCmd`
- `handleTop`
- `init`
- `isUserIdentityMismatch`
- `loadHugTypes`
- `normalizeLogin`
- `nowIso`
- `nowMs`
- `pickRandom`
- `pickWeightedHugType`
- `readJsonIfExists`
- `renderTemplate`
- `resolveUserByLogin`
- `responseText`

## erkannte Datenbanktabellen

- `hug_pair_stats`
- `hug_pending_rehugs`
- `hug_users`

## erkannte Config-/Runtime-Dateien

- `hug.json`
- `hug_system.json`
- `hug_types.json`

## interne Abhängigkeiten

- `./helpers/helper_config`
- `./helpers/helper_core`
- `./helpers/helper_routes`
- `./sqlite_core`
- `./twitch`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Unbedingt Zuständigkeit zu hug.js klären, bevor daran weitergebaut wird.
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
