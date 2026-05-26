# Ko-fi Provider Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/kofi.js` aus dem aktuellen Backend-Upload.  
Kategorie: `alert-provider`

## Zweck

Ko-fi Provider-Modul für Alert-/Provider-Events und Integration in alert_system.

## Datei

```text
backend/modules/kofi.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `module.exports = ...`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/alerts/kofi/status` |
| `POST` | `/api/alerts/kofi/reload` |
| `POST` | `/api/alerts/kofi/config` |
| `GET` | `/api/alerts/kofi/test` |
| `POST` | `/api/alerts/kofi/webhook` |

## erkannte Hauptfunktionen / interne Bereiche

- `buildKofiTitle`
- `buildLocalTestEvent`
- `buildStatus`
- `cleanKey`
- `cleanText`
- `ensureRuntime`
- `ensureSchema`
- `errorMessage`
- `formatAmount`
- `getHost`
- `getIp`
- `handleKofiEvent`
- `hasCloudflareTunnelHeaders`
- `init`
- `isDirectLocalRequest`
- `loadSettings`
- `mapKofiType`
- `maskSettings`
- `mergeSettings`
- `normalizeKofiEvent`
- `nowIso`
- `parseJson`
- `parseKofiPayload`
- `postJsonInternal`
- `rememberProviderEvent`
- `safeEqual`
- `sanitizeRawKofi`
- `seedAlertTypesAndRules`
- `seedSettings`
- `stripSensitive`
- `toNumber`
- `updateProviderEvent`
- `updateSettings`
- `verifyWebhook`

## erkannte Datenbanktabellen

- `alert_provider_events`
- `alert_rules`
- `alert_settings`
- `alert_types`

## erkannte Config-/Runtime-Dateien

- Keine konkreten Config-/Runtime-Dateien eindeutig erkannt.

## interne Abhängigkeiten

- `../core/database`
- `./helpers/helper_routes`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Provider-Secrets/Webhooks nicht dokumentieren oder committen.
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
