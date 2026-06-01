# CURRENT_STATUS

## Aktueller Stand: CAN-9.4

Recovery-Preflight read-only Route ist vorhanden und der CAN-9.x-Routenkontext wurde bereinigt.

```text
GET /api/bus-diagnostics/recovery-preflight
version: 1.2.9
routeVersion: CAN-9.4
currentStep: CAN-9.4
nextAllowedStep: CAN-9.5_recovery_preflight_route_context_live_test_acceptance
readOnly: true
canPrepare: false
canExecute: false
```

Keine Recovery-Ausfuehrung, keine Command-Route, keine POST-Route.
