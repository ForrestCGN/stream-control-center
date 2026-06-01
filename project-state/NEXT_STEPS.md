# NEXT_STEPS

## Naechster Schritt

Empfohlener Start:

```text
CAN-14.5 - Dashboard Safety Status View Live-Test read-only
```

## CAN-14.5 Ziel

CAN-14.5 soll den neuen Safety-Status-Subtab live pruefen.

Zu pruefen:

```text
Dashboard laedt ohne JS-Fehler
Recovery-Tab laedt
Subtab Safety Status sichtbar
Keine produktiven Buttons im Safety Status
Hard-Blocker sichtbar
Bestehende Subtabs funktionieren weiter
Keine neue API erforderlich
Keine POST-/Mutation-Aufrufe
```

## Empfohlene Tests

```bat
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s | Select-Object ok,module,version,readOnly,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
```

```powershell
$p = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-preflight"
$p | Select-Object ok,module,version,readOnly,canPrepare,canExecute
```

## Weiterhin nicht direkt umsetzen

- Alert Replay
- Sound Replay
- Queue Clear
- Overlay State Repair
- Execute Recovery
- Auto Recovery
- Auto Retry Overlay
- Streamer.bot Action Retry
- OBS Source Refresh
