# EVENTBUS CAN-5.9.2 RECOVERY DASHBOARD COMPACT LAYOUT

Stand: 2026-06-01
Status: Dashboard-Layout-Fix / read-only Anzeige

## Ausgangslage

CAN-5.9 hat die Recovery-Diagnose im Bus-Diagnostics-Dashboard sichtbar gemacht.
CAN-5.9.1 hat lange Recovery-Source-Werte lesbarer gemacht.

Der erste Layout-Fix war funktional korrekt, wirkte aber zu breit und zu debug-lastig.

## Ziel von CAN-5.9.2

Die Recovery-Ansicht wird kompakter und dashboard-tauglicher dargestellt.

~~~text
Recovery-Quelle nicht mehr als riesige Vollbreiten-Liste
Recovery-Quelle kompakt als Kachelgruppe
Blockierte Aktionen, erlaubte Aktionen und Gründe bleiben direkt darunter sichtbar
Simulation-Harness bleibt read-only sichtbar
~~~

## Geänderte Datei

~~~text
htdocs/dashboard/modules/bus_diagnostics.js
~~~

## Nicht geändert

~~~text
Keine Backend-Änderung
Keine Simulation-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Änderung
Keine Queue-Logik
Keine Sound-Logik
Keine Overlay-Logik
~~~

## Sicherheitsregel

~~~text
Das Dashboard zeigt nur Diagnosewerte an.
Es löst keine Simulation aus.
Es löst keine Recovery aus.
Es wiederholt keine Alerts oder Sounds.
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-5.10: Recovery-Dashboard optisch prüfen und danach stabil dokumentieren
~~~
