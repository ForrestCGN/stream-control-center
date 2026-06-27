# CURRENT CHAT HANDOFF – CAN-8.7 Recovery-Preflight Check-Matrix Plan

Stand: 2026-06-01
Marker: STEP_CAN8_7_RECOVERY_PREFLIGHT_CHECK_MATRIX_PLAN

## Kurzstatus

CAN-8.7 plant die spaetere read-only Check-Matrix fuer `recoveryPreflight`.

## Aktuell stabil

~~~text
CAN-8.3: recoveryPreflight Backend-Statusfeld aktiv
CAN-8.5: Preflight-Dashboard-Anzeige umgesetzt
CAN-8.5.1: Preflight-Untertab-Klick repariert
CAN-8.6: Dashboard-Live-Test abgenommen
CAN-8.7: Check-Matrix geplant
~~~

## Geplante Check-Kategorien

~~~text
core
safety
readiness
correlation
queue
sound
alert
overlay
dashboard
audit
route_boundary
~~~

## Weiterhin nicht vorhanden

~~~text
Keine Preflight-Route
Keine Prepare-Route
Keine Execute-Route
Keine Command-Route
Keine Recovery-Ausfuehrung
Keine Dashboard-Aktionsbuttons
~~~

## Naechster sinnvoller Schritt

~~~text
CAN-8.8: Recovery-Preflight Check-Matrix read-only Statusfelder planen
~~~

Vor Code zuerst klaeren:

~~~text
Welche Minimal-Checks duerfen in bus_diagnostics.js additiv berechnet werden?
Welche Summary-Felder sind noetig?
Welche Checks sind blockierend?
Welche Checks bleiben nur Info?
Welche Dashboard-Anzeige darf daraus entstehen?
~~~
