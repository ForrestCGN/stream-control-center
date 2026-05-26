# Sound Output Config Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/sound_output_config.js` aus dem aktuellen Backend-Upload.  
Kategorie: `sound-runtime`

## Zweck

Kleines Config-Modul zur Verwaltung von Audio-Ausgabe/Device in sound_system.json.

## Datei

```text
backend/modules/sound_output_config.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `module.exports = ...`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `${prefix}/output` |
| `POST` | `${prefix}/output` |
| `GET` | `${prefix}/devices` |
| `POST` | `${prefix}/devices/select` |
| `POST` | `${prefix}/test-output` |

## erkannte Hauptfunktionen / interne Bereiche

- `boolValue`
- `extractDevices`
- `fallbackDevices`
- `getField`
- `helperInfo`
- `init`
- `intValue`
- `loadConfig`
- `normalizeDevice`
- `normalizeTarget`
- `outputState`
- `readDevicesViaHelper`
- `resolveHelperPath`
- `saveConfig`

## erkannte Datenbanktabellen

- Keine Datenbanktabellen per SQL-/Konstanten-Analyse erkannt.

## erkannte Config-/Runtime-Dateien

- `/overlays/sound_system_overlay.html`
- `sound_system.json`

## interne Abhängigkeiten

- `./helpers/helper_config`
- `./helpers/helper_core`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Nur Config-Schicht; keine Queue-/Playback-Logik hineinziehen.
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
