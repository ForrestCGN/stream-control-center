# STEP362_ALERT_RECONNECT_LIVE_WATCH

## Ziel
Live-Diagnose für STEP360: Während eines laufenden Alerts mehrfach Status pollen und in eine Logdatei schreiben, damit Overlay-Reconnect-/Recovery-Spuren nicht im Endsnapshot verloren gehen.

## Dateien
- `tools/diagnostics/STEP362_watch_alert_reconnect_live.ps1`

## Nutzung
```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\diagnostics\STEP362_watch_alert_reconnect_live.ps1 -ResetWatchdog -WatchSeconds 60 -IntervalSeconds 2
```

Während das Skript läuft: einen langen Alert starten und die Alert-Browserquelle in OBS einmal aktualisieren.

Optional mit Test-Trigger:
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\diagnostics\STEP362_watch_alert_reconnect_live.ps1 -ResetWatchdog -TriggerTestAlert -WatchSeconds 60 -IntervalSeconds 2
```

## Bewertung
- `alertStep=360`
- `overlayClients >= 1`
- `watchdogIssues=0`
- `missingAck=0`
- während `currentEventId/currentStatus=playing` nach OBS-Reload sollte ein Recovery-Eintrag sichtbar werden, z. B. `reconnect_resend`.

## Keine Codeänderung
Dieser STEP ändert keine Backend-/Overlay-Dateien. Es ist nur Diagnose.
