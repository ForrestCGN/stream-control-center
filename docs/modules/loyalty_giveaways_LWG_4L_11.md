# Loyalty Giveaways – LWG-4L.11

## Änderung
Der Runtime-Handler für `!wheel` / `!rad` liefert ohne offene Permission jetzt den spezifischen Fehlercode:

```text
wheel_no_permission
```

Der Text-Key bleibt:

```text
wheel.no_permission
```

## Zweck
Bessere Diagnose in Logs, Tests und Dashboard-Auswertungen.

## Keine Funktionsänderung
Ohne offene Wheel-Permission startet weiterhin kein Wheel-Spin.
