# Current Chat Handoff - CAN-10.7

## Stand

CAN-10.7 schliesst den Block `manual_diagnostics_refresh` ab.

## Abgeschlossener Stand

Button im Dashboard:

```text
Preflight neu laden
```

Bereich:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Der Button ruft nur bestehende GET-Endpunkte erneut ab:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

## Wichtige Grenze

Der Button ist keine Recovery-Aktion.

Weiterhin verboten:

- POST
- Command
- Prepare
- Execute
- Recovery-Ausfuehrung
- Queue-/Sound-/Alert-/Overlay-Mutation
- DB-/Config-Schreibzugriff

## Naechster Schritt

CAN-11.0:

```text
Manual Recovery Candidate Selection Start Boundary
```

Empfehlung: Erst eine Kandidatenmatrix planen, bevor irgendeine echte Recovery-Funktion umgesetzt wird.
