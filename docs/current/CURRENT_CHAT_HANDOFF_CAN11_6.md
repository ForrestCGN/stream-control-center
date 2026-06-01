# Current Chat Handoff - CAN-11.6

## Stand

CAN-11.6 schliesst den Block `manual_status_resync_request` ab.

## Abgeschlossener Stand

Dashboard-Karte:

```text
Manueller Status-Resync
```

Button:

```text
Status neu synchronisieren
```

Der Button ruft nur bestehende GET-Endpunkte erneut ab:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

## Wichtige Grenze

Der Button ist keine Recovery-Ausfuehrung.

Weiterhin verboten:

- POST
- Command
- Prepare
- Execute
- Recovery-Ausfuehrung
- Queue-/Sound-/Alert-/Overlay-Mutation
- DB-/Config-Schreibzugriff

## Naechster Schritt

CAN-12.0:

```text
Manual Recovery Guard Framework Start Boundary
```

Empfehlung: Erst ein einheitliches Guard-Framework planen, bevor produktive Recovery-Kandidaten weitergehen.
