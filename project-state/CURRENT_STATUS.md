## STEP CAN-9.1 Recovery-Preflight Route-Vertrag

Stand: 2026-06-01
Marker: STEP_CAN9_1_RECOVERY_PREFLIGHT_ROUTE_CONTRACT_PLAN

CAN-9.1 definiert den Sicherheitsvertrag fuer eine spaetere read-only Recovery-Preflight-Route.

Geplante spaetere Route:

~~~text
GET /api/bus-diagnostics/recovery-preflight
~~~

Diese Route darf nur vorhandene Diagnose ausgeben.

Weiterhin nicht aktiv:

~~~text
Keine Backend-Aenderung
Keine API-Route
Keine Dashboard-Aenderung
Keine Config
Keine DB
Keine Recovery-Ausfuehrung
Keine produktive Flow-Aenderung
~~~

Harte Sperren bleiben:

~~~text
Keine POST-/Command-Route
Keine Prepare-/Execute-Route
Keine Alert-/Sound-Replays
Keine Overlay-Retry-Aktion
Keine Auto-Recovery
Keine Dashboard-Aktionsbuttons
~~~

Naechster Schritt:

~~~text
CAN-9.2: Recovery-Preflight GET-Route minimal read-only planen oder umsetzen.
~~~

Details: `docs/system-inspection/EVENTBUS_CAN9_1_RECOVERY_PREFLIGHT_ROUTE_CONTRACT_PLAN.md`
