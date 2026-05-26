# Deathcounter V2 Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/deathcounter_v2.js` aus dem aktuellen Backend-Upload.  
Kategorie: `overlay-runtime`

## Zweck

Großes Deathcounter-V2-Modul mit Command-API, Overlay-State, Spielerlisten, Storage-/Import-/Backup-Routen und Stream/Game-Sync.

## Datei

```text
backend/modules/deathcounter_v2.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `module.exports = ...`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/deathcounter/v2/status` |
| `GET` | `/api/deathcounter/v2/config` |
| `GET` | `/api/deathcounter/v2/settings` |
| `GET` | `/api/deathcounter/v2/admin/settings` |
| `POST` | `/api/deathcounter/v2/admin/settings` |
| `GET` | `/api/deathcounter/v2/admin/texts` |
| `POST` | `/api/deathcounter/v2/admin/texts` |
| `GET` | `/api/deathcounter/v2/routes` |
| `GET` | `/api/deathcounter/v2/integration-check` |
| `GET` | `/api/deathcounter/v2/storage/preview` |
| `GET` | `/api/deathcounter/v2/storage/validate` |
| `POST` | `/api/deathcounter/v2/storage/import` |
| `GET` | `/api/deathcounter/v2/storage/consistency` |
| `GET` | `/api/deathcounter/v2/storage/read-test` |
| `GET` | `/api/deathcounter/v2/storage/export` |
| `POST` | `/api/deathcounter/v2/storage/export` |
| `GET` | `/api/deathcounter/v2/storage/backup` |
| `POST` | `/api/deathcounter/v2/storage/backup` |
| `POST` | `/api/deathcounter/v2/reload` |
| `GET` | `/api/deathcounter/v2/command` |
| `POST` | `/api/deathcounter/v2/command` |
| `GET` | `/api/deathcounter/v2/state` |
| `GET` | `/api/deathcounter/v2/players` |
| `GET` | `/api/deathcounter/v2/overlay` |
| `GET` | `/api/deathcounter/v2/show` |
| `POST` | `/api/deathcounter/v2/show` |
| `GET` | `/api/deathcounter/v2/hide` |
| `POST` | `/api/deathcounter/v2/hide` |
| `GET` | `/api/deathcounter/v2/overlay/show` |
| `POST` | `/api/deathcounter/v2/overlay/show` |
| `GET` | `/api/deathcounter/v2/overlay/hide` |
| `POST` | `/api/deathcounter/v2/overlay/hide` |
| `GET` | `/api/deathcounter/v2/overlay/toggle` |
| `POST` | `/api/deathcounter/v2/overlay/toggle` |
| `GET` | `/api/deathcounter/v2/game` |
| `POST` | `/api/deathcounter/v2/game` |
| `GET` | `/api/deathcounter/v2/game/set` |
| `GET` | `/api/deathcounter/v2/sync/channelinfo` |
| `GET` | `/api/deathcounter/v2/stream-online-sync` |
| `POST` | `/api/deathcounter/v2/players` |
| `POST` | `/api/deathcounter/v2/overlay/players` |
| `GET` | `/api/deathcounter/v2/overlay/resetplayers` |
| `GET` | `/api/deathcounter/v2/overlay/replace` |
| `POST` | `/api/deathcounter/v2/overlay/replace` |
| `GET` | `/api/deathcounter/v2/rip` |
| `POST` | `/api/deathcounter/v2/rip` |
| `GET` | `/api/deathcounter/v2/del` |
| `POST` | `/api/deathcounter/v2/del` |
| `GET` | `/api/deathcounter/v2/tode` |
| `POST` | `/api/deathcounter/v2/session-reset` |
| `POST` | `/api/deathcounter/v2/total-reset` |
| `GET/POST` | `/api/deathcounter/v2/admin/settings` |
| `GET/POST` | `/api/deathcounter/v2/admin/texts` |
| `GET/POST` | `/api/deathcounter/v2/storage/export` |
| `GET/POST` | `/api/deathcounter/v2/storage/backup` |
| `GET/POST` | `/api/deathcounter/v2/command` |
| `GET/POST` | `/api/deathcounter/v2/show` |
| `GET/POST` | `/api/deathcounter/v2/hide` |
| `GET/POST` | `/api/deathcounter/v2/overlay/show` |
| `GET/POST` | `/api/deathcounter/v2/overlay/hide` |
| `GET/POST` | `/api/deathcounter/v2/overlay/toggle` |
| `GET/POST` | `/api/deathcounter/v2/overlay/replace` |
| `GET/POST` | `/api/deathcounter/v2/game` |
| `GET/POST` | `/api/deathcounter/v2/rip` |
| `GET/POST` | `/api/deathcounter/v2/del` |

## erkannte Hauptfunktionen / interne Bereiche

- `addGame`
- `addIssue`
- `addOverlayExtraPlayer`
- `applyCommandChatOutput`
- `applyDeathDelta`
- `bodyOrQuery`
- `booleanOrDefault`
- `broadcastState`
- `buildDeathcounterAdminSettings`
- `buildDeathcounterAdminTexts`
- `buildDeathcounterConfig`
- `buildDeathcounterIntegrationCheck`
- `buildDeathcounterRoutes`
- `buildDeathcounterSettings`
- `buildDeathcounterStorageConsistency`
- `buildDeathcounterStoragePreview`
- `buildDeathcounterStorageReadTest`
- `buildDeathcounterStorageRows`
- `buildDeathcounterStorageStatus`
- `buildDeathcounterStorageValidation`
- `buildJsonStateFromActiveDatabaseStorage`
- `buildStateFromImportedStorageRows`
- `buildTodePlayerDetail`
- `buildTodeSummary`
- `canReadActiveDatabaseStorage`
- `clampStats`
- `cleanLogin`
- `clearOverlayExtraPlayers`
- `collectCommandArgs`
- `commandBooleanOption`
- `commandOk`
- `commandUserError`
- `compareCollection`
- `consistencyFingerprint`
- `createDeathcounterImportBackup`
- `createEmptyState`
- `createPlayer`
- `deathcounterText`
- `deathcounterTextOptions`
- `decodeStorageOverlayValue`
- `ensureDeathcounterSettings`
- `ensureDeathcounterStorageSchema`
- `ensureDir`
- `ensureGameBucketsForAllPlayers`
- `ensureGameStats`
- `ensureStateFile`
- `exportDeathcounterJsonFromDatabase`
- `fail`
- `fetchJson`
- `fileCheck`
- `findPlayerOrThrow`
- `findPlayerStrict`
- `firstDeathcounterDefaultText`
- `getActiveStorageInfo`
- `getCommandOptions`

## erkannte Datenbanktabellen

- `deathcounter_settings`

## erkannte Config-/Runtime-Dateien

- `_overlay-deathcounter-v2.html`
- `death_counter.json`
- `deathcounter.v2.json`

## interne Abhängigkeiten

- `../core/database`
- `./helpers/helper_chat_output`
- `./helpers/helper_config`
- `./helpers/helper_core`
- `./helpers/helper_settings`
- `./helpers/helper_texts`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Sehr großes Modul. Änderungen nur in kleinen Schritten, weil Overlay, Chatcommands und Storage eng zusammenhängen.
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
