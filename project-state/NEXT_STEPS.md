# NEXT_STEPS

## Naechster Schritt

Empfohlener Start:

```text
CAN-14.4 - Dashboard Safety Status Anzeige umsetzen, falls freigegeben
```

## Wichtig vor CAN-14.4

Vor Umsetzung zuerst:

```text
GitHub/dev bzw. echte Dateien pruefen.
Ziel kurz zusammenfassen.
Betroffene Dateien nennen.
Geplante Aenderung nennen.
Explizit nennen, was NICHT geaendert wird.
Tests nennen.
Auf Forrests go warten.
```

## Voraussichtlich relevante Dateien fuer CAN-14.4

Vor jeder Umsetzung pruefen:

```text
htdocs/dashboard/modules/bus_diagnostics.js
backend/modules/bus_diagnostics.js
backend/modules/communication_bus.js
docs/system-inspection/EVENTBUS_CAN14_1_SAFETY_STATUS_CONTRACT_READONLY.md
docs/system-inspection/EVENTBUS_CAN14_2_BACKEND_STATUS_SHAPE_READONLY_PLANNING.md
docs/system-inspection/EVENTBUS_CAN14_3_DASHBOARD_SAFETY_STATUS_VIEW_PLANNING.md
```

## CAN-14.4 Zielrichtung

Nur falls freigegeben:

```text
Dashboard Safety Status Anzeige read-only umsetzen
keine Buttons
keine Recovery
keine Mutation
keine POST-Aufrufe
```

## Weiterhin nicht direkt umsetzen

- Alert Replay
- Sound Replay
- Queue Clear
- Overlay State Repair
- Execute Recovery
- Auto Recovery
- Auto Retry Overlay
- Streamer.bot Action Retry
- OBS Source Refresh
