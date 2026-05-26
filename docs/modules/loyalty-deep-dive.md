# Loyalty-System Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/loyalty.js` aus dem aktuellen Backend-Upload.  
Kategorie: `community-points`

## Zweck

Punkte-/Watchtime-/Event-System mit eigener Stream-State-/Runner-Logik und vielen Tabellen.

## Datei

```text
backend/modules/loyalty.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `DEFAULT_CONFIG`
- `SETTINGS_DEFINITIONS`
- `_private`
- `buildStatus`
- `calculateWatchAmount`
- `compensateRecentSubscribeForResubCollision`
- `getAutoRunnerStatus`
- `init`
- `listLoyaltyEvents`
- `normalizeLogin`
- `recordEventBonus`
- `recordTransaction`
- `recordWatchHeartbeat`
- `recordWatchInterval`
- `recoverAutoRunnerFromStoredStreamStateOnBoot`
- `startAutoRunner`
- `stopAutoRunner`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/loyalty/status` |
| `GET` | `/api/loyalty/config` |
| `GET` | `/api/loyalty/settings` |
| `POST` | `/api/loyalty/settings` |
| `GET` | `/api/loyalty/users` |
| `GET` | `/api/loyalty/users/:login` |
| `GET` | `/api/loyalty/balance/:login` |
| `GET` | `/api/loyalty/transactions` |
| `POST` | `/api/loyalty/transactions/adjust` |
| `GET` | `/api/loyalty/test/watch` |
| `GET` | `/api/loyalty/watch/heartbeat` |
| `POST` | `/api/loyalty/watch/heartbeat` |
| `GET` | `/api/loyalty/watch/states` |
| `GET` | `/api/loyalty/stream-state` |
| `GET` | `/api/loyalty/stream-state/start` |
| `POST` | `/api/loyalty/stream-state/start` |
| `GET` | `/api/loyalty/stream-state/stop` |
| `POST` | `/api/loyalty/stream-state/stop` |
| `GET` | `/api/loyalty/stream-state/clear-override` |
| `POST` | `/api/loyalty/stream-state/clear-override` |
| `GET` | `/api/loyalty/stream-state/refresh-auto` |
| `POST` | `/api/loyalty/stream-state/refresh-auto` |
| `GET` | `/api/loyalty/presence/status` |
| `GET` | `/api/loyalty/presence/run-once` |
| `POST` | `/api/loyalty/presence/run-once` |
| `GET` | `/api/loyalty/runner/status` |
| `GET` | `/api/loyalty/runner/start` |
| `POST` | `/api/loyalty/runner/start` |
| `GET` | `/api/loyalty/runner/stop` |
| `POST` | `/api/loyalty/runner/stop` |
| `GET` | `/api/loyalty/runner/run-once` |
| `POST` | `/api/loyalty/runner/run-once` |
| `GET` | `/api/loyalty/runner/events` |
| `GET` | `/api/loyalty/events` |
| `POST` | `/api/loyalty/events/ingest` |
| `GET` | `/api/loyalty/events/test/:type` |
| `GET` | `/api/loyalty/ignored-users` |
| `POST` | `/api/loyalty/ignored-users` |
| `DELETE` | `/api/loyalty/ignored-users/:login` |
| `GET` | `/api/loyalty/routes` |

## erkannte Hauptfunktionen / interne Bereiche

- `addMinutesIso`
- `applySettingsToConfig`
- `applyStreamStateChange`
- `buildStatus`
- `calculateEventBonus`
- `calculateWatchAmount`
- `cleanDisplayName`
- `clearManualStreamState`
- `compensateRecentSubscribeForResubCollision`
- `controlAutoRunnerForStreamState`
- `counts`
- `databaseStatus`
- `ensureLoyaltyEventsTable`
- `ensureRunnerEventsTable`
- `ensureSchema`
- `ensureSettingsSeeded`
- `ensureStreamStateRow`
- `ensureStreamStateTable`
- `ensureTextsSeeded`
- `ensureUser`
- `executeAutoRunnerOnce`
- `fetchJson`
- `fetchPresenceActiveUsers`
- `findRecentSubscribeForResubCollision`
- `getAutoRunnerIntervalSeconds`
- `getAutoRunnerStatus`
- `getIgnoredUsers`
- `getNestedValue`
- `getStreamState`
- `getSubscribeResubCollisionDedupeConfig`
- `getUser`
- `getWatchState`
- `hasNestedValue`
- `init`
- `insertLoyaltyEventRow`
- `isIgnoredUser`
- `listLoyaltyEvents`
- `listRunnerEvents`
- `listTransactions`
- `listUsers`
- `listWatchStates`
- `loadConfig`
- `logRunnerEvent`
- `logStreamStateEvent`
- `markSubscribeReplacedByResub`
- `markWatchRewarded`
- `mergePlain`
- `modeBalanceField`
- `modeTotalFields`
- `normalizeEventType`
- `normalizeImportStatus`
- `normalizeLogin`
- `normalizeMode`
- `normalizeSettingValue`
- `normalizeTier`

## erkannte Datenbanktabellen

- `loyalty_events`
- `loyalty_ignored_users`
- `loyalty_imports`
- `loyalty_reservations`
- `loyalty_runner_events`
- `loyalty_settings`
- `loyalty_stream_state`
- `loyalty_transactions`
- `loyalty_users`
- `loyalty_watch_state`

## erkannte Config-/Runtime-Dateien

- `loyalty.json`

## interne Abhängigkeiten

- `../core/database`
- `./helpers/helper_config`
- `./helpers/helper_core`
- `./helpers/helper_settings`
- `./helpers/helper_texts`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Live-/Stream-State nicht ungeprüft neben stream_status weiterentwickeln; perspektivisch an zentrale Stream-Status-Quelle angleichen.
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
