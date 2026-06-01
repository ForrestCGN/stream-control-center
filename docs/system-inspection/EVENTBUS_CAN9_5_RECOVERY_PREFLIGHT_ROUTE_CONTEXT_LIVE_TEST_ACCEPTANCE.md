# EVENTBUS CAN-9.5 — Recovery-Preflight Route-Kontext Live-Test Abnahme

## Status

CAN-9.5 ist ein reiner Dokumentations- und Abnahmeschritt.

Die in CAN-9.4 umgesetzte read-only Route-Kontext-Bereinigung wurde live gegen den laufenden Node-Server getestet und erfolgreich abgenommen.

## Getestete Route

```text
GET /api/bus-diagnostics/recovery-preflight
```

## Live-Test Ergebnis

Die Route meldet korrekt:

```text
module: bus_diagnostics
version: 1.2.9
feature: recovery_preflight
routeVersion: CAN-9.4
mode: read_only_preflight_route
readOnly: true
currentStep: CAN-9.4
nextAllowedStep: CAN-9.5_recovery_preflight_route_context_live_test_acceptance
canPrepare: false
canExecute: false
```

## Route-Kontext

Der neue Route-Kontext ist vorhanden und korrekt gefüllt:

```text
currentStep: CAN-9.4
nextAllowedStep: CAN-9.5_recovery_preflight_route_context_live_test_acceptance
sourcePreflightCurrentStep: CAN-8.9
sourcePreflightNextAllowedStep: CAN-8.10_preflight_check_matrix_live_test_acceptance
sourceReadinessCurrentStep: CAN-7.1
sourceReadinessNextAllowedStep: CAN-7.2_read_only_dashboard_display_planning
routeOnly: true
readOnly: true
```

Damit ist klar getrennt:

- Der neue CAN-9.x Route-Kontext ist aktiv.
- Der ältere CAN-8.x Preflight-Quellkontext bleibt nachvollziehbar erhalten.
- Der ältere CAN-7.x Readiness-Quellkontext bleibt nachvollziehbar erhalten.

## Summary-Felder

Die Summary liefert jetzt den bereinigten CAN-9.x NextStep und zusätzlich den CAN-8.x Source-NextStep:

```text
recoveryPreflightStatus: ready
recoveryPreflightCheckCount: 13
recoveryPreflightBlockingCheckCount: 0
recoveryPreflightWarningCheckCount: 0
recoveryPreflightSourceNextStep: CAN-8.10_preflight_check_matrix_live_test_acceptance
recoveryPreflightNextStep: CAN-9.5_recovery_preflight_route_context_live_test_acceptance
```

## Route-Safety

Die Safety-Grenze bleibt unverändert korrekt:

```text
method: GET
readOnly: true
commandRoute: false
executeRoute: false
prepareRoute: false
recoveryExecution: false
```

## Abnahme

CAN-9.4 ist live technisch bestätigt.

CAN-9.5 dokumentiert diese Abnahme und schließt den Route-Kontext-/NextStep-Fix ab.

## Nicht geändert

In CAN-9.5 wurde nichts Produktives geändert:

- Keine Backend-Datei geändert
- Keine Dashboard-Datei geändert
- Keine API-Route geändert
- Keine Config geändert
- Keine Datenbank geändert
- Keine Recovery-Ausführung hinzugefügt
- Keine Prepare-Route hinzugefügt
- Keine Execute-Route hinzugefügt
- Keine Command-Route hinzugefügt
- Keine Queue-/Sound-/Alert-/Overlay-Steuerung geändert

## Nächste Grenze

Der nächste erlaubte Schritt ist CAN-9.6.

CAN-9.6 darf nur geplant werden, bevor erneut Code geändert wird.

Mögliche Richtung für CAN-9.6:

- Dashboard optional auf die neue read-only Route `/api/bus-diagnostics/recovery-preflight` umstellen oder ergänzen
- Weiterhin nur read-only Anzeige
- Keine Buttons
- Keine Ausführung
- Keine POST-/Command-/Prepare-/Execute-Routen
