# Next Steps

## CAN-9.7

Implement dashboard consumption of the dedicated read-only route:

```text
GET /api/bus-diagnostics/recovery-preflight
```

Allowed file:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Forbidden:

```text
No recovery execution.
No POST route.
No command route.
No prepare route.
No execute route.
No action buttons.
```
