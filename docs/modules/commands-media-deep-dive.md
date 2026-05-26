# Commands Media Bridge Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/commands_media.js` aus dem aktuellen Backend-Upload.  
Kategorie: `chat-control`

## Zweck

Ergänzung zum Command-System für Media-Auswahl und Prüfung von Sound-/Video-Kommandos.

## Datei

```text
backend/modules/commands_media.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `checkStoredMediaCommand`
- `init`
- `listMediaOptions`
- `statusPayload`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/commands/media-options` |
| `GET` | `/api/commands/media-bridge/status` |
| `GET` | `/api/commands/media-command-check` |

## erkannte Hauptfunktionen / interne Bereiche

- `checkStoredMediaCommand`
- `clean`
- `commandActionKey`
- `commandMediaType`
- `commandTargetUrl`
- `expectedRouteForMediaId`
- `init`
- `listMediaOptions`
- `mediaIdFromCommand`
- `normalizeTrigger`
- `optionFromAsset`
- `readCommandByTrigger`
- `safeJsonDecode`
- `splitTypes`
- `statusPayload`

## erkannte Datenbanktabellen

- Keine Datenbanktabellen per SQL-/Konstanten-Analyse erkannt.

## erkannte Config-/Runtime-Dateien

- `/overlays/sound_system_overlay.html`

## interne Abhängigkeiten

- `../core/database`
- `./helpers/helper_core`
- `./media`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Nur mit commands.js und media/sound/video Bridges zusammen betrachten.
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
