# CURRENT_STATUS

## Stand: CAN-14.5 Live-Test vorbereitet

Der Recovery-/Preflight-/Guard-Framework-Strang ist weiterhin read-only abgeschlossen.

CAN-14.4 hat die Dashboard Safety Status View read-only umgesetzt.

CAN-14.5 ist als lokaler Live-Test vorbereitet.

Status:

```text
pending_local_test
```

## Aktuelle read-only Funktionen

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
Button: Preflight neu laden
Button: Status neu synchronisieren
Karte: Recovery Guards
Subtab: Safety Status
```

## CAN-14.5 Sicherheitsstand

Weiterhin keine Recovery-Ausfuehrung.

```text
canPrepare: false
canExecute: false
readOnly: true
routeSafety.method: GET
commandRoute: false
prepareRoute: false
executeRoute: false
recoveryExecution: false
safetyStatusApi: false
dashboardSafetyStatusView: true
dashboardRecoveryButtons: false
backendSafetyStatusShapeImplemented: false
localLiveTest: pending
```

## CAN-14.5 Ergebnis

```text
Live-Test-Checkliste erstellt.
Test ist lokal ausstehend.
Nicht als bestanden markiert.
```

## Weiterhin hart blockiert

```text
Alert Replay
Sound Replay
Queue Clear
Overlay State Repair
Execute Recovery
Auto Recovery
Auto Retry Overlay
Streamer.bot Action Retry
OBS Source Refresh
```
