# CURRENT_STATUS

## Stand: CAN-14.2 abgeschlossen

Der Recovery-/Preflight-/Guard-Framework-Strang ist weiterhin read-only abgeschlossen.

Der CAN-13-Strang ist als Sicherheitsplanung fuer spaetere manuelle Recovery abgeschlossen.

Der CAN-14-Strang ist weiterhin read-only Safety Status View Planung.

Abgeschlossen:

- CAN-8.x Recovery-Preflight Statusfelder und Dashboard
- CAN-9.x dedizierte read-only Preflight-Route
- CAN-10.x Manual Diagnostics Refresh
- CAN-11.x Manual Status Resync
- CAN-12.x Manual Recovery Guard Framework / Recovery Guards Dashboard-Karte
- CAN-13.x Recovery Safety Planning abgeschlossen
- CAN-14.0 Read-only Safety Status View Planning
- CAN-14.1 Safety Status Contract read-only
- CAN-14.2 Backend Status Shape read-only Planning

## Aktuelle read-only Funktionen

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
Button: Preflight neu laden
Button: Status neu synchronisieren
Karte: Recovery Guards
```

## Aktueller Live-Test-Stand Recovery Guards

```text
Guards: 16
OK: 16
Warnings: 0
Blocked: 0
Errors: 0
Blocking Failed: 0
```

## CAN-14.2 Sicherheitsstand

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
dashboardSafetyStatusView: false
dashboardRecoveryButtons: false
backendSafetyStatusShapeImplemented: false
```

## CAN-14.2 Ergebnis

```text
Backend Status Shape read-only geplant.
bus_diagnostics ist spaeter naheliegender Modul-Kandidat.
MutationCheck als Pflichtbestandteil geplant.
Feldherkunft und unknown-Regeln festgelegt.
Naechster Schritt ist CAN-14.3 Dashboard Safety Status Anzeige planen.
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
