# Start Overlay Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/start_overlay.js` aus dem aktuellen Backend-Upload.  
Kategorie: `overlay-runtime`

## Zweck

Start-Overlay-Modul mit Chat-Snapshot, Config, Reload und WebSocket-Bootstrap.

## Datei

```text
backend/modules/start_overlay.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `init`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/overlay/start/status` |
| `GET` | `/api/overlay/start/config` |
| `GET` | `/api/overlay/start-chat` |
| `POST` | `/api/overlay/start-chat` |
| `GET` | `/api/overlay/start-chat/clear` |
| `POST` | `/api/overlay/start-chat/clear` |
| `GET` | `/api/overlay/start/reload` |
| `POST` | `/api/overlay/start/reload` |

## erkannte Hauptfunktionen / interne Bereiche

- `addChatMessage`
- `attachWebSocketListener`
- `bodyOrQuery`
- `broadcast`
- `clearChat`
- `configFilePath`
- `ensureMessagesFile`
- `handleChat`
- `handleClear`
- `handleReload`
- `init`
- `isIgnoredUser`
- `loadRuntime`
- `messagesFilePath`
- `normalizeChatItem`
- `normalizeChatSegments`
- `normalizeFallbackChatMessages`
- `normalizeRotatorMessages`
- `pickRequestValue`
- `publicChatSnapshot`
- `publicConfig`
- `publicStatus`
- `sendOverlayBootstrap`

## erkannte Datenbanktabellen

- Keine Datenbanktabellen per SQL-/Konstanten-Analyse erkannt.

## erkannte Config-/Runtime-Dateien

- `start_overlay.json`

## interne Abhängigkeiten

- `./helpers/helper_config`
- `./helpers/helper_core`
- `./helpers/helper_messages`
- `./helpers/helper_routes`
- `./helpers/helper_texts`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Overlay-HTML und Node-State zusammen testen.
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
