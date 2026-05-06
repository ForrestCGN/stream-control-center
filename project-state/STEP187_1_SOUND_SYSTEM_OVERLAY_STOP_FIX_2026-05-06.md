# STEP187.1 - Sound-System Overlay Stop Fix

Stand: 2026-05-06

## Zweck

Dieser STEP behebt den Fall, dass ein laufender Sound-/Video-Player im Sound-System-Overlay weiterlaeuft, obwohl das Backend durch `POST /api/sound/stop`, `POST /api/sound/skip` oder `POST /api/sound/clear` bereits `current = null` meldet.

## Live-Befund vor dem Fix

Getestet wurde im Live-System:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=soundalerts/video/3cgn.mp4&category=test&priority=100&outputTarget=device&volume=80" | ConvertTo-Json -Depth 30
```

Ergebnis:

- Datei wurde gefunden.
- Wiedergabe wurde gestartet.
- Das Item lief aber im Overlay weiter.
- `POST /api/sound/stop` setzte Backend-State auf `current = null`.
- `POST /api/sound/skip` und `POST /api/sound/clear` setzten ebenfalls Backend-State/Queue korrekt.
- Der OBS-Browser spielte trotzdem weiter, bis die Browserquelle manuell neu geladen wurde.

## Ursache

Das Overlay hatte zwar eine Stop-Logik fuer WebSocket-Reasons wie `manual_stop`, `manual_skip`, `stop_stream`, `skip_stream` und `reset`, aber kein robustes Safety-Net fuer den Fall, dass das Backend im Polling bereits `current = null` meldet, waehrend im Browser noch ein Player mit `currentRequestId` aktiv ist.

## Aenderung

Betroffene Datei:

- `htdocs/overlays/sound_system_overlay.html`

Ergaenzt wurde:

- zentrale `STOP_REASONS`-Liste
- Helper `stopIfBackendIsIdle(...)`
- WebSocket-Stop-Handling nur dann, wenn Backend kein `current` mehr meldet
- Polling-Safety-Net:
  - Wenn `/api/sound/status` `current = null` liefert
  - und das Overlay noch `currentRequestId` gesetzt hat
  - dann stoppt das Overlay lokal Audio/Video, entfernt die Quelle und setzt den Player zurueck.

## Bewusst nicht geaendert

- Normale Wiedergabe wird nicht abgebrochen.
- Backend-Queue-Logik wurde nicht veraendert.
- Device-Playback wurde in diesem STEP nicht repariert oder veraendert.
- `backend/modules/sound_system.js` wurde nicht geaendert.
- Keine DB-/Schema-Aenderung.
- Keine Secrets, keine Config-Dateien, keine SQLite-Dateien.

## Erwartetes Verhalten nach Deploy

1. Langen Overlay-Sound starten.
2. `POST /api/sound/stop` ausfuehren.
3. Backend meldet `current = null`.
4. Overlay stoppt spaetestens beim naechsten Polling-Zyklus lokal den Player.
5. Kein OBS-Browser-Cache-Reload mehr noetig.

## Test-Kommandos nach Deploy

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=soundalerts/video/3cgn.mp4&category=test&priority=100&volume=80" | ConvertTo-Json -Depth 30

Start-Sleep -Seconds 3

Invoke-RestMethod "http://127.0.0.1:8080/api/sound/stop" -Method POST | ConvertTo-Json -Depth 30

Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 30
```

Erwartung:

- Backend: `current = null`
- Overlay: Video/Audio stoppt sichtbar/hoerbar ohne Browser-Reload
- Queue bleibt leer

## Zusaetzlicher Befund fuer spaeter

Der Test mit `outputTarget=device` ueber GET ergab trotzdem ein Item mit `outputTarget = overlay`. Das ist ein separater Folgepunkt und wurde in diesem STEP nicht veraendert.

Moeglicher Folge-STEP:

- Sound-System Device-Playback / `outputTarget=device` Parameterfluss pruefen und reparieren.
