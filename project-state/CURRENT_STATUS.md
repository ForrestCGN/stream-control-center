# CURRENT_STATUS

## Stand: CAN-13.6 abgeschlossen

Der Recovery-/Preflight-/Guard-Framework-Strang ist weiterhin read-only abgeschlossen.

Der CAN-13-Strang ist als Sicherheitsplanung fuer spaetere manuelle Recovery abgeschlossen.

Abgeschlossen:

- CAN-8.x Recovery-Preflight Statusfelder und Dashboard
- CAN-9.x dedizierte read-only Preflight-Route
- CAN-10.x Manual Diagnostics Refresh
- CAN-11.x Manual Status Resync
- CAN-12.x Manual Recovery Guard Framework / Recovery Guards Dashboard-Karte
- CAN-13.0 Next Recovery Candidate Planning Start
- CAN-13.1 Audit-Konzept
- CAN-13.2 Rollen-/Rechte-Konzept
- CAN-13.3 Confirm-/Bestaetigungs-Konzept
- CAN-13.4 SafetyStop-/Cancel-Konzept
- CAN-13.5 Recovery-Kandidatenmatrix
- CAN-13.6 Recovery Safety Planning Closure

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

## CAN-13.6 Sicherheitsstand

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
candidateApi: false
safetyStopApi: false
cancelApi: false
auditApi: false
rightsApi: false
confirmApi: false
dashboardRecoveryButtons: false
```

## CAN-13 Abschluss

```text
Audit-Konzept dokumentiert.
Rollen-/Rechte-Konzept dokumentiert.
Confirm-Konzept dokumentiert.
SafetyStop-/Cancel-Konzept dokumentiert.
Recovery-Kandidatenmatrix dokumentiert.
CAN-13 Sicherheitsplanung abgeschlossen.
```

## Niedriges Risiko / spaeter zuerst betrachtbar

```text
diagnostics_refresh
status_resync_readonly
preflight_recheck
guard_recheck
safety_state_view
overlay_client_ping_recheck
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

## Naechster sinnvoller Strang

```text
CAN-14.0 - Read-only Safety Status View Planning
```
