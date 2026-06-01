# Current Chat Handoff - CAN-10.6

## Stand

CAN-10.6 dokumentiert die Live-Test-Abnahme fuer den Status-/UX-Cleanup des Buttons:

```text
Preflight neu laden
```

## Technischer Stand

Der Button wurde in CAN-10.2 eingefuehrt und in CAN-10.5 um lokalen Status-/UX-State erweitert.

Geaenderte Datei aus CAN-10.5:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Erwartetes Verhalten

Der Button ruft nur bestehende GET-Endpunkte erneut ab:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

## Naechster sinnvoller Schritt

Wenn der Dashboard-Test bestaetigt ist:

```text
CAN-10.7 - Manual Diagnostics Refresh Block Closure / CAN-11 Start Gate
```

oder ein kleiner Fehlerfix, falls die Anzeige nicht sauber aktualisiert wird.

## Weiterhin verboten

- Recovery-Ausfuehrung
- Prepare
- Execute
- Replay
- Queue-Clear
- Sound-/Alert-/Overlay-Mutation
