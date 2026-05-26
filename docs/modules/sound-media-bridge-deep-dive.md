# Sound Media Bridge Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/sound_media_bridge.js` aus dem aktuellen Backend-Upload.  
Kategorie: `sound-runtime`

## Zweck

Sound-Bridge zum Abspielen von Media-Assets über das Sound-System.

## Datei

```text
backend/modules/sound_media_bridge.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `init`
- `statusPayload`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/sound/media-bridge/status` |
| `GET` | `/api/sound/play-media` |
| `POST` | `/api/sound/play-media` |
| `GET/POST` | `/api/sound/play-media` |

## erkannte Hauptfunktionen / interne Bereiche

- `bool`
- `buildSoundPayload`
- `clean`
- `ensureCacheCopy`
- `httpJsonRequest`
- `init`
- `isPathInside`
- `normalizeMediaTarget`
- `normalizeOutputTarget`
- `normalizeSlashes`
- `numberParam`
- `pickMediaRef`
- `playMedia`
- `resolvePayloadMediaType`
- `safeFileName`
- `statusPayload`
- `stringParam`

## erkannte Datenbanktabellen

- Keine Datenbanktabellen per SQL-/Konstanten-Analyse erkannt.

## erkannte Config-/Runtime-Dateien

- `/overlays/sound_system_overlay.html`

## interne Abhängigkeiten

- `./helpers/helper_config`
- `./helpers/helper_core`
- `./media`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Soll Media-Auswahl und Sound-Ausgabe verbinden, aber nicht das Sound-System ersetzen.
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
