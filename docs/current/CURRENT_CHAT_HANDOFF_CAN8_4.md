# CURRENT CHAT HANDOFF – CAN-8.4

Stand: 2026-06-01

## Status

CAN-8.4 ist ein reiner Planungsstep für die spätere Dashboard-Anzeige von `recoveryPreflight`.

## Ergebnis

- CAN-8.3 Backend-Feld `recoveryPreflight` ist live bestätigt.
- CAN-8.4 legt fest, wie die Anzeige im Dashboard read-only erfolgen darf.
- Keine Code-Datei wurde geändert.

## Nächster Schritt

~~~text
CAN-8.5: Dashboard-Preflight read-only Anzeige umsetzen
~~~

## Erlaubter Scope für CAN-8.5

~~~text
Nur htdocs/dashboard/modules/bus_diagnostics.js
Nur Anzeige
Keine Buttons
Keine API-Änderung
Keine Recovery-Ausführung
~~~

## Wichtige Grenze

`canPrepare=false` und `canExecute=false` bleiben korrekt. CAN-8.5 darf sie nur anzeigen, nicht ändern.
