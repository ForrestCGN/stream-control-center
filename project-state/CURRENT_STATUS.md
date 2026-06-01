# CURRENT_STATUS

## Stand: CAN-13.2 abgeschlossen

Der Recovery-/Preflight-/Guard-Framework-Strang ist read-only abgeschlossen.

CAN-13.0 hat den naechsten Recovery-Planungsstrang gestartet.

CAN-13.1 hat das Audit-Konzept fuer spaetere manuelle Recovery-Aktionen geplant.

CAN-13.2 hat das Rollen-/Rechte-Konzept fuer spaetere manuelle Recovery-Aktionen geplant.

Abgeschlossen:

- CAN-8.x Recovery-Preflight Statusfelder und Dashboard
- CAN-9.x dedizierte read-only Preflight-Route
- CAN-10.x Manual Diagnostics Refresh
- CAN-11.x Manual Status Resync
- CAN-12.x Manual Recovery Guard Framework / Recovery Guards Dashboard-Karte
- CAN-13.0 Next Recovery Candidate Planning Start
- CAN-13.1 Audit-Konzept fuer spaetere manuelle Recovery
- CAN-13.2 Rollen-/Rechte-Konzept fuer spaetere manuelle Recovery

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

## Sicherheitsstand

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
```

## CAN-13.2 Ergebnis

CAN-13.2 ist ein reiner Doku-/Planungsstand.

Festgelegt:

```text
Rollen: Viewer / Moderator / Admin / Owner / System
Dashboard-Sichtbarkeit ist keine Berechtigung
Backend-Pflichtpruefung fuer spaetere Aktionen
Denied-/Blocked-Audit-Bezug
Owner/Admin-Grenzen fuer spaetere Recovery-nahe Aktionen
System darf keine stille produktive Recovery ausloesen
```

Entscheidung:

```text
Keine produktive Recovery als naechster Schritt.
Naechster Schritt: CAN-13.3 Confirm-/Bestaetigungs-Konzept.
```

Geplante Reihenfolge:

```text
CAN-13.3 Confirm-/Bestaetigungs-Konzept fuer spaetere manuelle Recovery
CAN-13.4 SafetyStop-/Cancel-Konzept
CAN-13.5 Recovery-Kandidatenmatrix
CAN-13.6 Abschluss/Handoff, weiterhin ohne produktive Recovery
```

Weiterhin hart blockiert:

```text
Alert Replay
Sound Replay
Queue Clear
Overlay State Repair
Execute Recovery
Auto-Recovery
POST-/Command-/Prepare-/Execute-Routen
produktive Dashboard-Recovery-Buttons
Audit-DB-Migration
Audit-Schreibroute
Rechte-API
Rollen-DB-Migration
produktive Rechtepruefung im Code
```
