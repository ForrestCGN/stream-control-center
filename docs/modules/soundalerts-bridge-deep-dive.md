# SoundAlerts Bridge Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/soundalerts_bridge.js` aus dem aktuellen Backend-Upload.  
Kategorie: `sound-runtime`

## Zweck

Bridge für SoundAlerts-ähnliche Einträge, Events, Stats und Dashboard-/Integration-Checks.

## Datei

```text
backend/modules/soundalerts_bridge.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `module.exports = ...`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/soundalerts/status` |
| `GET` | `/api/soundalerts/events` |
| `GET` | `/api/soundalerts/stats` |
| `GET` | `/api/soundalerts/config` |
| `GET` | `/api/soundalerts/settings` |
| `GET` | `/api/soundalerts/routes` |
| `GET` | `/api/soundalerts/integration-check` |
| `GET` | `/api/soundalerts/entries` |
| `DELETE` | `/api/soundalerts/entries/:entryKey` |
| `POST` | `/api/soundalerts/entries/:entryKey/delete` |
| `POST` | `/api/soundalerts/entries/:entryKey/ignore` |
| `POST` | `/api/soundalerts/config` |
| `POST` | `/api/soundalerts/settings` |
| `POST` | `/api/soundalerts/upload` |
| `POST` | `/api/soundalerts/test/chat` |
| `POST` | `/api/soundalerts/reload` |

## erkannte Hauptfunktionen / interne Bereiche

- `applySettingsToConfig`
- `applyTemplate`
- `buildResult`
- `buildSoundAlertsIntegrationCheck`
- `buildSoundAlertsRoutes`
- `canSendChatNotice`
- `candidateAutoEntryFiles`
- `categoryDefaultPriority`
- `cloneDefaultParserMessageFormats`
- `connectInternalWs`
- `databaseStatus`
- `dbRowToRule`
- `defaultOutputTargetForMedia`
- `deleteEntryRule`
- `detectMediaType`
- `directoryCheck`
- `effectivePriority`
- `ensureAutoEntryForParsed`
- `ensureDatabaseReady`
- `ensureEntriesSeededFromConfig`
- `ensureSchema`
- `ensureSettingsSeeded`
- `entriesTableReady`
- `entryKeyFromRule`
- `findEntryByKey`
- `findExistingAutoEntryFile`
- `findExistingRuleBySoundAlertName`
- `findRule`
- `finish`
- `getEffectiveRules`
- `getMetaValue`
- `getNestedValue`
- `getUploadConfig`
- `handleChatItem`
- `handleUploadRequest`
- `hasNestedValue`
- `ignoreEntryRule`
- `init`
- `insertEvent`
- `listEntryRules`
- `listEvents`
- `listSoundAlertSettings`
- `loadConfig`
- `mergePlain`
- `normalizeCategory`
- `normalizeFilenameBase`
- `normalizeJsonSettingArray`
- `normalizeLogin`
- `normalizeMediaType`
- `normalizeName`
- `normalizeOutputTarget`
- `normalizeParsedSoundName`
- `normalizeParserMessageFormatItem`
- `normalizeParserMessageFormats`
- `normalizeRuleForDb`

## erkannte Datenbanktabellen

- `soundalerts_bridge_entries`
- `soundalerts_bridge_events`
- `soundalerts_bridge_meta`
- `soundalerts_bridge_settings`

## erkannte Config-/Runtime-Dateien

- `soundalerts_bridge.json`

## interne Abhängigkeiten

- `../core/database`
- `./helpers/helper_config`
- `./helpers/helper_core`
- `./helpers/helper_media`
- `./helpers/helper_settings`
- `./twitch`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Nicht mit sound_system oder alert_system verwechseln; Bridge-Zuständigkeit separat halten.
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
