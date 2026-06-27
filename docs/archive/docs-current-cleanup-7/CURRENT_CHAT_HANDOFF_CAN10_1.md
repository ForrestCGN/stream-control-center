# Current Chat Handoff - CAN-10.1

## Stand

CAN-10.1 plant den Vertrag fuer `manual_diagnostics_refresh`.

## Ergebnis

Die erste harmlose manuelle Aktion soll spaeter nur ein Dashboard-Refresh sein:

```text
Preflight neu laden
```

Technisch darf sie nur GET-Endpunkte erneut abrufen:

```text
GET /api/bus-diagnostics/recovery-preflight
GET /api/bus-diagnostics/status
```

## Wichtige Grenze

Weiterhin verboten:

- POST
- Command
- Prepare
- Execute
- Recovery-Ausfuehrung
- Queue-/Sound-/Alert-/Overlay-Mutation
- DB-/Config-Schreibzugriff

## Naechster Schritt

CAN-10.2:

```text
Manual Diagnostics Refresh Dashboard Button
```

Erlaubt waere nur eine additive Dashboard-Datei-Aenderung in:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Der Button darf nur read-only GET-Daten neu laden.
