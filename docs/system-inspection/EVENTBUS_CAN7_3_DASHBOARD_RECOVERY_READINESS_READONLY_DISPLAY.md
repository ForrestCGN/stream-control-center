# EVENTBUS CAN-7.3 DASHBOARD RECOVERY-READINESS READ-ONLY DISPLAY

Stand: 2026-06-01
Status: Umsetzung / Dashboard-Anzeige / read-only

## Ziel

CAN-7.3 zeigt die mit CAN-7.1 eingefuehrten `recoveryReadiness`-Statusfelder im bestehenden Recovery-Tab des Bus-Diagnostics-Dashboards an.

## Geaenderte Datei

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Art der Aenderung

Additive Anzeige im bestehenden Recovery-Tab:

```text
Recovery-Readiness
Readiness-Safety
Readiness-Checks
Readiness-Blocker
Hart blockierte Recovery-Aktionen
```

## Bewusst nicht umgesetzt

```text
Keine Backend-Aenderung
Keine API-Aenderung
Keine neue Route
Keine POST-/Command-Route
Keine Recovery-Ausfuehrung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine Config-Aenderung
Keine DB-Migration
Keine produktive Flow-Aenderung
```

## Anzeigequelle

Die Anzeige liest ausschliesslich aus:

```text
/api/bus-diagnostics/status
response.recoveryReadiness
response.summary.recoveryReadinessStatus
response.summary.recoveryReadinessCanStartReadOnlyCode
response.summary.recoveryReadinessNextStep
```

## Sicherheitsregeln

Die Dashboard-Anzeige darf nur informieren. Sie darf keine Aktion ausloesen.

Weiterhin hart blockiert:

```text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
manual_recovery_execution
```

## Tests

Syntax:

```cmd
node -c htdocs\dashboard\modulesus_diagnostics.js
```

API-Grundlage:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s.recoveryReadiness | Select-Object status,canStartReadOnlyCode,readOnly,currentStep,nextAllowedStep
$s.recoveryReadiness | Select-Object automationEnabled,productiveActions,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
```

Dashboard-Pruefung:

```text
Dashboard oeffnen
Event-Bus / Communication Bus oeffnen
Tab Recovery oeffnen
Recovery-Readiness sichtbar
Readiness-Safety sichtbar
Keine Recovery-Buttons sichtbar
Keine Simulation-Buttons sichtbar
```

## Naechster sinnvoller Schritt

```text
CAN-7.4: Dashboard-Anzeige live testen und dokumentieren
```
