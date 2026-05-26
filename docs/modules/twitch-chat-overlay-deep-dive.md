# Twitch Chat Overlay Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/twitch_chat_overlay.js` aus dem aktuellen Backend-Upload.  
Kategorie: `overlay-runtime`

## Zweck

Twitch-Chat-Overlay mit IRC/Emote-Auflösung, Chat-State, Debug und Start/Stop/Reconnect.

## Datei

```text
backend/modules/twitch_chat_overlay.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `module.exports = ...`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/overlay/chat/config` |
| `GET` | `/api/overlay/chat/settings` |
| `GET` | `/api/overlay/chat/routes` |
| `GET` | `/api/overlay/chat/integration-check` |
| `POST` | `/api/overlay/chat/reload` |
| `GET` | `/api/overlay/chat/status` |
| `GET` | `/api/overlay/chat/start` |
| `POST` | `/api/overlay/chat/start` |
| `GET` | `/api/overlay/chat/stop` |
| `POST` | `/api/overlay/chat/stop` |
| `GET` | `/api/overlay/chat/reconnect` |
| `POST` | `/api/overlay/chat/reconnect` |
| `GET` | `/api/overlay/chat/clear` |
| `POST` | `/api/overlay/chat/clear` |
| `GET` | `/api/overlay/chat/emotes/lookup` |
| `GET` | `/api/overlay/chat/debug` |
| `GET` | `/api/overlay/chat/emotes/status` |
| `GET` | `/api/overlay/chat/emotes/reload` |
| `POST` | `/api/overlay/chat/emotes/reload` |
| `GET` | `${prefix}/status` |
| `GET` | `${prefix}/config` |
| `GET` | `${prefix}/settings` |
| `GET` | `${prefix}/routes` |
| `GET` | `${prefix}/integration-check` |
| `POST` | `${prefix}/reload` |
| `GET/POST` | `${prefix}/start` |
| `GET/POST` | `${prefix}/stop` |
| `GET/POST` | `${prefix}/reconnect` |
| `GET/POST` | `${prefix}/clear` |
| `GET` | `${prefix}/debug` |
| `GET` | `${prefix}/emotes/status` |
| `GET/POST` | `${prefix}/emotes/reload` |
| `GET` | `${prefix}/emotes/lookup` |

## erkannte Hauptfunktionen / interne Bereiche

- `addChatItem`
- `broadcast`
- `buildCheck`
- `buildSegments`
- `buildSegmentsFromKnownNames`
- `cleanupTimers`
- `clearChat`
- `diagnosticsConfig`
- `diagnosticsIntegrationCheck`
- `diagnosticsReload`
- `diagnosticsRoutes`
- `diagnosticsSettings`
- `emoteUrl`
- `fail`
- `getBotAccessToken`
- `handlePrivmsg`
- `helixGet`
- `init`
- `isIgnoredUser`
- `loadTwitchEmotes`
- `loginFromPrefix`
- `lookupEmoteByName`
- `normalizeEmoteName`
- `parseEmoteTag`
- `parseIrcLine`
- `parseTags`
- `pickEmoteImage`
- `publicEmoteStatus`
- `publicStatus`
- `resolveBroadcasterId`
- `responseEnvelope`
- `scheduleReconnect`
- `sendRaw`
- `sendSnapshot`
- `startConnection`
- `stopConnection`
- `storeEmote`
- `summarizeChecks`
- `unescapeIrcTagValue`

## erkannte Datenbanktabellen

- Keine Datenbanktabellen per SQL-/Konstanten-Analyse erkannt.

## erkannte Config-/Runtime-Dateien

- Keine konkreten Config-/Runtime-Dateien eindeutig erkannt.

## interne Abhängigkeiten

- `./helpers/helper_core`
- `./helpers/helper_messages`
- `./helpers/helper_routes`
- `./twitch`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Token-/Bot-Login-Themen und Emote-Caches vorsichtig behandeln.
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
