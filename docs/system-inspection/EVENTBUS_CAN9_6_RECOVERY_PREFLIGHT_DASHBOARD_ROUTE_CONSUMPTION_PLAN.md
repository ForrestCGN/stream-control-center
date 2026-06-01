# EVENTBUS CAN-9.6 - Recovery-Preflight Dashboard Route Consumption Plan

## Status

CAN-9.6 is a planning-only step.

The read-only route from CAN-9.2/CAN-9.4 is live and verified:

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

The goal of the next technical dashboard step is to let the dashboard use this dedicated read-only route for the Preflight subtab.

## Goal for the later code step

The dashboard module should prefer the dedicated route for Recovery-Preflight display data:

```text
GET /api/bus-diagnostics/recovery-preflight
```

The existing full status route remains valid and must stay untouched:

```text
GET /api/bus-diagnostics/status
```

The dashboard must not gain any action controls.

## Allowed later scope

For the next implementation step, the allowed scope is limited to:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Allowed changes:

```text
- Add a read-only fetch for /api/bus-diagnostics/recovery-preflight.
- Store the route response separately from the main status response.
- Prefer the dedicated route data in the Preflight subtab.
- Keep fallback to the full status response if the dedicated route is not reachable.
- Display routeContext if available.
- Display routeSafety if available.
- Keep existing Check-Matrix, Scope and Safety display.
```

## Strictly forbidden

```text
- No POST route.
- No command route.
- No prepare route.
- No execute route.
- No recovery execution.
- No recovery button.
- No simulation button.
- No retry button.
- No replay button.
- No queue touch.
- No sound touch.
- No alert touch.
- No overlay touch.
- No database change.
- No config migration.
```

## Dashboard behaviour contract

The Preflight subtab should show data from the dedicated route when available:

```text
routeVersion
currentStep
nextAllowedStep
routeContext.currentStep
routeContext.nextAllowedStep
routeContext.sourcePreflightCurrentStep
routeContext.sourcePreflightNextAllowedStep
routeContext.sourceReadinessCurrentStep
routeContext.sourceReadinessNextAllowedStep
routeSafety.method
routeSafety.readOnly
routeSafety.commandRoute
routeSafety.executeRoute
routeSafety.prepareRoute
routeSafety.recoveryExecution
recoveryPreflight.checkSummary
recoveryPreflight.checks[]
recoveryPreflight.scope[]
summary.recoveryPreflightNextStep
summary.recoveryPreflightSourceNextStep
```

The dashboard must keep showing:

```text
canPrepare: false
canExecute: false
readOnly: true
```

## Fallback behaviour

If the dedicated route is unavailable, the dashboard may use the existing status response:

```text
status.recoveryPreflight
status.summary
```

Fallback must be visible as read-only diagnostic information only. It must not enable buttons or actions.

## UI expectation

The Preflight subtab should become clearer by separating:

```text
- Route context
- Route safety
- Preflight summary
- Check matrix
- Scope
- Blocked actions
```

The old historical CAN-7 Readiness values may still be visible in the Readiness subtab, but the Preflight subtab should focus on the active CAN-9 route context.

## Tests for the later implementation step

Syntax:

```cmd
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Browser/dashboard check:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Expected visible values:

```text
routeVersion: CAN-9.4
currentStep: CAN-9.4
nextAllowedStep: CAN-9.5_recovery_preflight_route_context_live_test_acceptance
readOnly: true
canPrepare: nein
canExecute: nein
method: GET
commandRoute: nein
executeRoute: nein
prepareRoute: nein
recoveryExecution: nein
checks: 13
ok: 13
warnings: 0
blocking: 0
blocked: 0
```

## Acceptance criteria

The next implementation step can be accepted only if:

```text
- The dedicated route is used for Preflight data when available.
- The dashboard remains display-only.
- No action buttons are visible.
- No productive route is called.
- The fallback to the full status route remains safe.
- Existing Recovery subtabs still work.
```

## Next step

CAN-9.7 may implement the dashboard consumption of the dedicated read-only route.
