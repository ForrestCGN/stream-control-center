# EVENTBUS CAN-5.9.3 RECOVERY-DASHBOARD CLEANUP-LAYOUT

Stand: 2026-06-01
Status: Dashboard-Layout-Fix / read-only

## Ausgangslage

CAN-5.9.2 hat den Recovery-Tab im Bus-Diagnostics-Dashboard wieder kompakter gemacht.
Im Live-Bild war die Recovery-Quelle funktional korrekt, aber lange State-Werte konnten in den Kacheln weiterhin unschön umbrechen.

## Ziel von CAN-5.9.3

CAN-5.9.3 räumt nur die Darstellung im Recovery-Tab auf.

~~~text
Recovery-Quelle kompakter als Zeilenliste
lange State-Werte ohne harten Wortumbruch
Tooltip mit vollständigem Wert
Blockierte Aktionen / Erlaubte Aktionen / Gründe bleiben sichtbar
Simulation-Harness bleibt read-only sichtbar
~~~

## Nicht geändert

~~~text
Keine Backend-Änderung
Keine API-Änderung
Keine Simulation-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Änderung
Keine Queue-/Sound-/Overlay-Logik geändert
~~~

## Sicherheitsregel

~~~text
Das Dashboard zeigt Recovery-Diagnose nur an.
Es löst keine Simulation aus.
Es löst keine Recovery aus.
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-5.10: Recovery-Dashboard live abnehmen und stabil dokumentieren
~~~
