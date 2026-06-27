# Current Chat Handoff - CAN-11.2

## Stand

CAN-11.2 plant den Vertrag fuer:

```text
manual_status_resync_request
```

## Ergebnis

Der Kandidat bleibt strikt read-only.

Erlaubt:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

Verboten:

- POST
- Command
- Prepare
- Execute
- Recovery-Ausfuehrung
- Queue-/Sound-/Alert-/Overlay-Mutation
- DB-/Config-Schreibzugriff

## Naechster Schritt

CAN-11.3:

```text
Manual Status Resync Request UI/Implementation Boundary
```

Nur Doku/Planung.
