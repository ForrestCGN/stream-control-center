# EVENTBUS CAN-5.9.1 RECOVERY-DASHBOARD LAYOUT-FIX

Stand: 2026-06-01
Status: Dashboard-Anzeige / Layout-Fix / read-only

## Ausgangslage

CAN-5.9 hat den Recovery-Tab im Bus-Diagnostics-Dashboard sichtbar gemacht.

Im Live-Check war die Funktion korrekt, aber lange State-Werte in der Recovery-Quelle wurden in schmalen Metric-Kacheln unschön umbrochen.

Beispiele:

~~~text
idle_no_recent_handshake
idle_no_recent_visual_delivery
~~~

## Ziel von CAN-5.9.1

CAN-5.9.1 verbessert nur die Lesbarkeit der Recovery-Anzeige.

## Geänderte Datei

~~~text
htdocs/dashboard/modules/bus_diagnostics.js
~~~

## Änderung

Die Recovery-Quelle wird nicht mehr als enge Metric-Kachelgruppe gerendert, sondern als breite Liste mit Label + Wert.

Zusätzlich werden lange Recovery-State-/Next-Action-Werte in der Recovery-Strategie als Code-/Wide-Metric dargestellt.

## Nicht geändert

~~~text
Keine Backend-Änderung
Keine Simulation-Buttons
Kein Aufruf von /api/bus-diagnostics/recovery-simulation/test
Keine Recovery-Automatik
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Änderung
~~~

## Erwarteter Test

Nach Deploy und Dashboard-Reload:

~~~text
Bus-Diagnostics öffnen
Tab Recovery öffnen
Recovery-Quelle prüfen
lange State-Werte sollen lesbarer dargestellt werden
keine Test-Buttons sichtbar
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-5.10: Dashboard-Recovery-Tab live prüfen und stabil dokumentieren
~~~
