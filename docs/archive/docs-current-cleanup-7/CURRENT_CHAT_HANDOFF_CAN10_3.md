# Current Chat Handoff - CAN-10.3

## Stand

CAN-10.3 dokumentiert die Live-Test-Abnahme fuer den Button:

```text
Preflight neu laden
```

## Technischer Stand

Der Button wurde in CAN-10.2 in folgender Datei umgesetzt:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Er darf nur bestehende GET-Daten neu laden:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

## Naechster sinnvoller Schritt

Wenn der Live-Test im Dashboard bestaetigt ist:

```text
CAN-10.4 - Manual Diagnostics Refresh Status/UX Cleanup Plan
```

oder Abschluss des CAN-10 Diagnose-Refresh-Blocks.

## Weiterhin verboten

- Recovery-Ausfuehrung
- Prepare
- Execute
- Replay
- Queue-Clear
- Sound-/Alert-/Overlay-Mutation
