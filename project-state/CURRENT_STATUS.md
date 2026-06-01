# CURRENT_STATUS

## Stand: CAN-13.5 abgeschlossen

Der Recovery-/Preflight-/Guard-Framework-Strang ist weiterhin read-only abgeschlossen.

Der CAN-13-Strang ist weiterhin reine Planung fuer spaetere manuelle Recovery-Sicherheit.

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

## CAN-13.5 Sicherheitsstand

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
dashboardCandidateButtons: false
```

## CAN-13.5 Ergebnis

```text
Recovery-Kandidaten wurden bewertet.
Read-only Diagnosekandidaten sind die einzigen niedrigen Risiken.
Sicherheitsstatus-Mutationen bleiben blockiert.
Produktive Recovery-Mutationen bleiben hart blockiert.
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
