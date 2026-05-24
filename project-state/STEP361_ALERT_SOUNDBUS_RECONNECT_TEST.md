# STEP361 – Alert/SoundBus Reconnect Testpaket

Stand: 2026-05-24

## Ziel

STEP361 ergänzt keine Produktivlogik. Der Schritt liefert ein kompaktes Diagnose-Skript, um den nach STEP360 gewünschten Reconnect-Fall reproduzierbar zu prüfen.

## Enthaltene Datei

```text
tools/diagnostics/STEP361_test_alert_soundbus_reconnect.ps1
```

## Prüfumfang

- Alert-System-Status lesen
- Sound-System/SoundBus-Status lesen
- Alert-Overlay-Clientanzahl prüfen
- Alert-Overlay-Watchdog prüfen
- SoundBus-Client-Events prüfen
- optional Test-Alert auslösen
- während des Testfensters OBS-Alert-Overlay-Reload beobachten

## Nicht enthalten

- keine Backend-Codeänderung
- keine Dashboard-Änderung
- keine Sound-System-Änderung
- keine Queue-Änderung
- keine DB-Migration
- keine Änderung am `activeBundleLock`

## Nutzung

Nur Status lesen:

```powershell
cd D:\Git\stream-control-center
.\tools\diagnostics\STEP361_test_alert_soundbus_reconnect.ps1
```

Watchdog zurücksetzen und Test-Alert starten:

```powershell
cd D:\Git\stream-control-center
.\tools\diagnostics\STEP361_test_alert_soundbus_reconnect.ps1 -ResetWatchdog -TriggerTestAlert -WatchSeconds 30
```

Während der Test-Alert läuft, die OBS-Browserquelle des Alert-Overlays einmal aktualisieren.

## Erwartung

- `/api/alerts/status` meldet `step=360`.
- Alert-Overlay-Client ist verbunden.
- Beim Overlay-Reload wird der laufende Alert erneut sichtbar nachversorgt.
- Sound/TTS startet dabei nicht erneut.
- Watchdog erzeugt keine neuen `missingFinishAck`-Probleme.
- SoundBus bleibt sauber und zeigt weiterhin Client-Events für Overlay-Audio.
