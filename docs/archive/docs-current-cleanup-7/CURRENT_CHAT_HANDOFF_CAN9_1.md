# CURRENT CHAT HANDOFF – CAN-9.1 Recovery Preflight Route Contract Plan

Stand: 2026-06-01

## Kurzstatus

CAN-9.1 ist ein reiner Planungsstep.

Es wurde der Sicherheitsvertrag fuer eine spaetere read-only GET-Route definiert.

## Ergebnis

Geplante spaetere Route:

~~~text
GET /api/bus-diagnostics/recovery-preflight
~~~

Diese Route darf nur vorhandene Preflight-Diagnose ausgeben.

## Weiterhin blockiert

~~~text
Keine POST-/Command-Route
Keine Prepare-/Execute-Route
Keine Recovery-Ausfuehrung
Keine Alert-/Sound-Replays
Keine Overlay-Retry-Aktionen
Keine Auto-Recovery
Keine Dashboard-Aktionsbuttons
~~~

## Naechster sinnvoller Schritt

~~~text
CAN-9.2: Recovery-Preflight GET-Route minimal read-only planen oder umsetzen.
~~~

Vor einem Code-Step muss die echte aktuelle Datei geprueft werden:

~~~text
backend/modules/bus_diagnostics.js
~~~

## Nicht geaendert

~~~text
Keine Backend-Datei
Keine Dashboard-Datei
Keine API-Route
Keine Config
Keine DB
Keine Recovery-Ausfuehrung
Keine produktive Flow-Aenderung
~~~
