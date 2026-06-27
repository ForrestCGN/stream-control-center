# Current Chat Handoff - CAN-11.5

## Stand

CAN-11.5 dokumentiert die Live-Test-Abnahme fuer die Dashboard-UI:

```text
manual_status_resync_request
```

## Technischer Stand

Die UI wurde in CAN-11.4 in folgender Datei umgesetzt:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Erwartetes Verhalten

Der Button `Status neu synchronisieren` ruft nur bestehende GET-Endpunkte erneut ab:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

## Naechster sinnvoller Schritt

Wenn der Dashboard-Test bestaetigt ist:

```text
CAN-11.6 - Manual Status Resync Block Closure / CAN-12 Start Gate
```

oder ein kleiner Fehlerfix, falls die Anzeige nicht sauber aktualisiert wird.

## Weiterhin verboten

- Recovery-Ausfuehrung
- Prepare
- Execute
- Replay
- Queue-Clear
- Sound-/Alert-/Overlay-Mutation
