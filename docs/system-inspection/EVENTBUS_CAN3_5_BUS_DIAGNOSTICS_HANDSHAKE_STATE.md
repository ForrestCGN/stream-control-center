# EVENTBUS CAN-3.5 BUS DIAGNOSTICS HANDSHAKE STATE

Stand: 2026-06-01  
Status: Repo-Patch / additive Diagnose

## Ziel

Der bereits bestätigte CAN-3.4 `handshakeState` aus der Alert/Sound-Korrelation wird im zentralen Bus-Diagnostics-Status sichtbar.

## Änderung

- `bus_diagnostics` Version `1.2.1` -> `1.2.2`
- `summary.handshakeState`
- `summary.handshakeOk`
- `summary.handshakeWarning`
- `summary.handshakeNextAction`
- `alertSoundCorrelation.handshakeState`
- `alertSoundCorrelation.traceCorrelationVersion`
- `alertSoundCorrelation.matchingKeys`

## Nicht geändert

```text
Keine Alert-Queue-Logik
Keine Sound-Playback-Logik
Keine Overlay-Logik
Keine DB-/Config-Änderung
Keine Recovery-Automatik
```

## Tests

```powershell
node tools\steps\apply_can3_5_bus_diagnostics_handshake.js
node -c backend\modules\bus_diagnostics.js
.\stepdone.cmd "STEP CAN-3.5 Bus Diagnostics Handshake State"
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/check" | ConvertTo-Json -Depth 10
```
