# CURRENT_STATUS

## STEP CAN-8.6 Recovery-Preflight Dashboard Live-Test und Abnahme

Stand: 2026-06-01
Marker: STEP_CAN8_6_RECOVERY_PREFLIGHT_DASHBOARD_LIVE_TEST_ACCEPTANCE

CAN-8.6 dokumentiert die Live-Abnahme der read-only Preflight-Anzeige im Bus-Diagnostics-Dashboard.

Bestaetigter Stand:

~~~text
Preflight-Untertab oeffnet korrekt.
Recovery-Preflight wird angezeigt.
Preflight-Safety wird angezeigt.
Prepare bleibt nein.
Execute bleibt nein.
Automation bleibt nein.
Productive bleibt nein.
Flow/Queue/Sound/Alert/Overlay touched bleiben nein.
Hart blockierte Preflight-Aktionen bleiben sichtbar.
Keine neuen Aktionsbuttons sichtbar.
~~~

Weiterhin nicht aktiv:

~~~text
Keine Recovery-Ausfuehrung
Keine Prepare-/Execute-Funktion
Keine POST-/Command-Route
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine produktive Flow-Aenderung
~~~

Details: `docs/system-inspection/EVENTBUS_CAN8_6_RECOVERY_PREFLIGHT_DASHBOARD_LIVE_TEST_ACCEPTANCE.md`
