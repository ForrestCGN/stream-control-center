# Current Status

## CAN-9.6

Recovery-Preflight Dashboard Route Consumption has been planned.

The dedicated read-only route is live and accepted from CAN-9.4/CAN-9.5:

```text
GET /api/bus-diagnostics/recovery-preflight
version: 1.2.9
routeVersion: CAN-9.4
readOnly: true
canPrepare: false
canExecute: false
```

CAN-9.6 made no code changes.
