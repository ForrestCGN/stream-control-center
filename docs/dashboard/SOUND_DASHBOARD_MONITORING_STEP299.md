# STEP299 – Sound Dashboard Monitoring Modul

Stand: 2026-05-24

## Ziel

Das bestehende Dashboard-Modul `Sound-System` wurde um einen rein lesenden SoundBus-Monitor erweitert.

Der Monitor soll vor weiteren Migrationen sichtbar machen, ob SoundBus, Communication-Bus, Queue, Bundle-Lock und Fehlerzähler stabil bleiben.

## Geänderte Dateien

- `htdocs/dashboard/modules/sound.js`
- `htdocs/dashboard/modules/sound.css`

## Neue Dashboard-Funktion

Im Sound-System gibt es nun den Tab:

- `Bus-Monitor`

Die Anzeige liest ausschließlich Daten aus `/api/sound/status`, insbesondere:

- `soundBus.enabled`
- `soundBus.communicationBusAvailable`
- `soundBus.stats.emitted`
- `soundBus.stats.errors`
- `soundBus.stats.skipped`
- `soundBus.stats.lastAction`
- `soundBus.stats.lastReason`
- `soundBus.stats.lastEventId`
- `soundBus.stats.lastError`
- `queuedCount`
- `current`
- `currentBundle`
- `activeBundleLock`
- `stats.failed`
- `stats.deviceFailed`
- `stats.discordFailed`

Zusätzlich ist ein Link zur vorhandenen Debug-View enthalten:

```text
/public/tools/soundbus_debug_view.html
```

## Sicherheitsgrenze

Der Bus-Monitor ist absichtlich nur lesend.

Nicht enthalten:

- keine SoundBus-Aktivierung/Deaktivierung
- keine Queue-Steuerung
- kein ACK-Verhalten
- keine WebSocket-Consumer-Logik im Dashboard
- keine Änderung an Backend, Queue, Bundle-Lock, Alert-System oder Discord

## Erwarteter Test

1. Dashboard öffnen.
2. Sound-System öffnen.
3. Tab `Bus-Monitor` öffnen.
4. Status prüfen:

```text
SoundBus aktiv
Communication verfügbar
Errors 0
Queue 0
Active Bundle Lock leer
```

5. Kleinen Sound auslösen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?id=test_ping"
```

6. Dashboard neu laden oder im Tab `Status neu laden` klicken.

Erwartung:

```text
soundBus.stats.emitted steigt
soundBus.stats.errors bleibt 0
Queue läuft wieder leer
```
