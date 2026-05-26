# STEP364_ALERT_CURRENT_LIFECYCLE_CHECK

## Ziel

Prüfen, ob `currentEventId` / `currentStatus=playing` nach Ende eines Alerts zuverlässig geleert werden.

## Hintergrund

STEP360 und STEP362 haben bestätigt, dass Overlay-Reconnect während laufendem Alert funktioniert:

- laufender Alert wird erneut visuell gesendet
- Sound/TTS startet nicht doppelt
- Queue bleibt unverändert
- Watchdog bleibt sauber

In den Logs fiel auf, dass `currentStatus=playing` gegen Ende noch sichtbar sein kann, obwohl `currentSound` bereits leer ist. Das kann korrekt sein, wenn Alert-Dauer länger als Sound-Dauer ist. STEP364 prüft deshalb gezielt den Lifecycle über Zeit.

## Enthalten

- `tools/diagnostics/STEP364_watch_alert_lifecycle.ps1`

## Keine Codeänderungen

Dieser STEP ändert keinen Backend-, Dashboard-, Overlay- oder Sound-Code.

## Test

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .	ools\diagnostics\STEP364_watch_alert_lifecycle.ps1 -WatchSeconds 90 -IntervalSeconds 2
```

Während das Skript läuft: einen längeren Alert starten und bis zum Ende laufen lassen.

## Bewertung

OK:

- `sawPlaying=True`
- `sawClearedAfterPlaying=True`
- `RESULT=OK Alert current lifecycle cleared after playing.`

Prüfen:

- `sawPlaying=True`
- `sawClearedAfterPlaying=False`
- `RESULT=CHECK ...`

Dann ist entweder die Watch-Zeit zu kurz oder `finishCurrent`/Ack-/Fallback-Logik muss separat geprüft werden.
