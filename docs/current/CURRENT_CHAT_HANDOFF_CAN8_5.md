# CURRENT CHAT HANDOFF – CAN-8.5

Stand: 2026-06-01

## Status

CAN-8.5 ist umgesetzt. Das Dashboard zeigt `recoveryPreflight` nun read-only im Recovery-Tab an.

## Geändert

~~~text
htdocs/dashboard/modules/bus_diagnostics.js
~~~

## Neu sichtbar

~~~text
Recovery -> Preflight
Recovery-Preflight
Preflight-Safety
Preflight-Scope
Preflight-Blocker
Preflight-Warnungen
Preflight-Checks
Hart blockierte Preflight-Aktionen
~~~

## Nicht geändert

~~~text
Keine Backend-Datei
Keine API-Route
Keine Config
Keine DB
Keine Recovery-Ausführung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Änderung
~~~

## Nächster Schritt

CAN-8.6: Dashboard-Preflight Read-only Anzeige live testen und abnehmen.
