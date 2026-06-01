# CURRENT_STATUS

## CAN-11.3

Die UI-/Implementation-Boundary fuer `manual_status_resync_request` ist dokumentiert.

CAN-11.4 darf nur additiv die Dashboard-Datei aendern:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Keine Backend-Aenderung, keine Recovery-Ausfuehrung.
