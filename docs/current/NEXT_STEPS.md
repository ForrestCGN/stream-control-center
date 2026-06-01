# NEXT_STEPS

Stand: 2026-06-01

## Direkt als naechstes empfohlen

```text
STEP279 – Heartbeat-Standard planen
```

Ziel: Module nicht blind umbauen, sondern zuerst einen einheitlichen Diagnosevertrag definieren.

## STEP279 Vorschlag

1. Heartbeat-Eventformat festlegen.
2. Communication Bus als Registry fuer letzte Heartbeats erweitern.
3. `/api/communication/status` oder separaten Diagnose-Endpunkt um Heartbeat-Status erweitern.
4. Pilotmodule anbinden:
   - `sound_system.js`
   - `alert_system.js`
   - `obs.js`
5. Danach Dashboard-Anzeige planen.

## Spaeter sinnvolle Schritte

```text
Dashboard-Modulstatus anzeigen
Route-Diagnose im Dashboard sichtbar machen
Heartbeat-/Health-Status pro Modul anzeigen
Warn-/Error-Zustand visuell hervorheben
Audit-Log fuer Dashboard-Aktionen weiter ausbauen
```

## Nicht sofort machen

```text
Nicht alle Module auf einmal mit Heartbeat versehen.
Keine lauten Heartbeats von reinen API-/Helper-Modulen.
Keine produktiven Flows ersetzen, solange Diagnose nicht stabil ist.
```
