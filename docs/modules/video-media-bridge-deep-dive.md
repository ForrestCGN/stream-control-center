# Video Media Bridge Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/video_media_bridge.js` aus dem aktuellen Backend-Upload.  
Kategorie: `media-runtime`

## Zweck

Video-/Animation-Bridge mit Player-State, Play/Stop/Ended-Routen und WS-Broadcast.

## Datei

```text
backend/modules/video_media_bridge.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `init`
- `playMedia`
- `statusPayload`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/video/media-bridge/status` |
| `GET` | `/api/video/media-player/state` |
| `POST` | `/api/video/stop-media` |
| `GET` | `/api/video/stop-media` |
| `POST` | `/api/video/media-player/ended` |
| `GET` | `/api/video/media-player/ended` |
| `GET` | `/api/video/play-media` |
| `POST` | `/api/video/play-media` |
| `GET/POST` | `/api/video/play-media` |

## erkannte Hauptfunktionen / interne Bereiche

- `bool`
- `broadcast`
- `buildPlaybackPayload`
- `clean`
- `clientEnded`
- `handlePlay`
- `init`
- `isVideoLike`
- `makeRequestId`
- `nowIso`
- `number`
- `param`
- `playMedia`
- `publicCurrent`
- `publicState`
- `pushHistory`
- `readMediaRef`
- `statusPayload`
- `stopMedia`
- `touch`

## erkannte Datenbanktabellen

- Keine Datenbanktabellen per SQL-/Konstanten-Analyse erkannt.

## erkannte Config-/Runtime-Dateien

- `/overlays/_overlay-media-player.html`
- `/overlays/sound_system_overlay.html`

## interne Abhängigkeiten

- `./helpers/helper_core`
- `./media`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Offiziellen Pfad und deprecated Testpfade sauber getrennt halten.
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
