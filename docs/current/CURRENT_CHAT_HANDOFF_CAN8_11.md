# CURRENT CHAT HANDOFF – CAN-8.11

Stand: 2026-06-01

## Kurzstatus

CAN-8.11 wurde umgesetzt.

Die Recovery-Preflight-Anzeige im Dashboard zeigt jetzt die CAN-8.9 Check-Matrix übersichtlicher an.

## Geändert

~~~text
htdocs/dashboard/modules/bus_diagnostics.js
~~~

## Ergebnis

~~~text
Preflight-Check-Matrix Karte ergänzt
Preflight-Scope nutzt recoveryPreflight.scope mit allowedScope-Fallback
Preflight-Checks werden als Tabelle angezeigt
Übersicht zeigt Check-Anzahl
~~~

## Nicht geändert

~~~text
Keine Backend-Datei
Keine API-Route
Keine Config
Keine DB
Keine Recovery-Ausführung
Keine produktive Flow-Änderung
Keine Recovery-/Simulation-Buttons
~~~

## Test

~~~cmd
node -c htdocs\dashboard\modulesus_diagnostics.js
~~~

## Nächster Schritt

~~~text
CAN-8.12: Dashboard-Live-Test und Abnahme der Preflight-Check-Matrix dokumentieren
~~~
