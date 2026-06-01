## Nach Dokumentationsabschluss CAN-6.1

Marker: STEP_CAN6_1_DOCUMENTATION_NEXT_STEPS

Nächster sinnvoller Arbeitsblock:

~~~text
CAN-6.2: Backend-Schutzvertrag fuer manuelle Recovery planen
~~~

Ziel von CAN-6.2:

~~~text
Noch kein produktiver Code.
Noch keine Dashboard-Buttons.
Noch keine Recovery-Ausführung.
Nur Schutzvertrag: Auth -> Audit -> Safety-Stop -> Status-Guards -> Duplikat-Sperren -> Rollback.
~~~

Pflichtfragen vor Umsetzung:

~~~text
Welche Owner/Admin-Pruefung wird verwendet?
Welche Audit-Log-Struktur wird fuer Recovery-Aktionen genutzt?
Wie wird ein globaler Recovery-Safety-Stop abgebildet?
Welche Modul-Safety-Stops braucht Alert/Sound/Overlay?
Welche Status-Guards pruefen laufende Alerts, Sounds, Queues und Bundle-Locks?
Wie werden traceId/alertId/eventId/bundleId/soundJobId gegen doppelte Ausfuehrung geschuetzt?
Welche Routen bleiben read-only?
Welche spaeteren Routen duerften nur mit Confirm-Token laufen?
~~~

Regel bleibt:

~~~text
Keine automatische Recovery
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine produktive Flow-Änderung
Kein Alert-Replay
Kein Sound-Replay
~~~

## Nach Dokumentationsabschluss CAN-6.0

Marker: STEP_CAN6_0_DOCUMENTATION_NEXT_STEPS

Nächster sinnvoller Arbeitsblock:

~~~text
CAN-6.1: Manuelle Recovery-Aktionsmatrix definieren
~~~

Ziel von CAN-6.1:

~~~text
Noch kein Code.
Noch keine Buttons.
Noch keine Recovery-Ausführung.
Nur Matrix: Zustand -> erlaubte manuelle Aktion -> Schutzmechanik -> Audit -> Rollback.
~~~

Pflichtfragen vor Umsetzung:

~~~text
Welche Zustände bleiben reine Diagnose?
Welche Zustände dürfen eine manuelle Recovery anbieten?
Welche Aktionen bleiben hart blockiert?
Welche Rechte braucht jede Aktion?
Welche Audit-Logs sind Pflicht?
Welche Duplikat-Sperren verhindern Alert-/Sound-Replays?
Wie wird Safety-Stop/Rollback umgesetzt?
Wie wird verhindert, dass Recovery doppelt feuert?
~~~


## Nach STEP CAN-6.0

Marker: STEP_CAN6_0_NEXT_STEPS

CAN-6.0 ist nur Planung für eine spätere abgesicherte manuelle Recovery.

Regel bleibt:

~~~text
Keine automatische Recovery
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine produktive Flow-Änderung
~~~

Nächster sinnvoller Schritt:

~~~text
CAN-6.1: Manuelle Recovery-Aktionsmatrix definieren
~~~

Vor Code zuerst festlegen:

~~~text
Welche Zustände bleiben reine Diagnose?
Welche Aktionen dürfen später manuell bestätigt werden?
Welche Aktionen bleiben hart blockiert?
Welche Rechte sind nötig?
Welche Audit-Logs sind Pflicht?
Welche Duplikat-Sperren schützen Alert/Sound/Overlay?
Wie wird Safety-Stop/Rollback umgesetzt?
~~~

## Nach STEP CAN-5.10

Marker: STEP_CAN5_10_NEXT_STEPS

CAN-5.5 bis CAN-5.10 bilden jetzt einen stabilen read-only Diagnose-Stand:

~~~text
Recovery-Strategy-State read-only
Simulation-Harness synthetisch/read-only
Dashboard-Anzeige read-only
Keine Simulation-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Änderung
~~~

Nächster sinnvoller Schritt:

~~~text
CAN-6.0: Abgesicherte manuelle Recovery-Planung vorbereiten
~~~

Vor jeder Umsetzung klären:

~~~text
Welche Recovery-Aktionen bleiben weiterhin nur Diagnose?
Welche Aktionen dürfen später manuell ausgelöst werden?
Welche Duplikat-Sperren verhindern Alert-/Sound-Replays?
Welche Rechte braucht ein Dashboard-Button?
Welche Audit-Logs sind Pflicht?
Wie sieht ein Rollback/Safety-Stop aus?
~~~

Regel bleibt:

~~~text
Keine automatische Recovery ohne separate Planung, Tests und klare Schutzmechanik.
~~~

## Nach STEP CAN-5.9.3

Marker: STEP_CAN5_9_3_NEXT_STEPS

Nächster sinnvoller Schritt:

~~~text
CAN-5.10: Recovery-Dashboard live abnehmen und stabil dokumentieren
~~~

Zu prüfen:

~~~text
Recovery-Quelle ist kompakt und lesbar
lange State-Werte brechen nicht störend um
keine Test-Buttons sichtbar
Read-only-Hinweis sichtbar
Dashboard wirkt aufgeräumt
~~~

Regeln bleiben:

~~~text
Keine Simulation per Dashboard
Keine Recovery-Automatik
Keine produktive Flow-Änderung
~~~

## Nach STEP CAN-5.9.2

Marker: STEP_CAN5_9_2_NEXT_STEPS

Nächster sinnvoller Schritt:

~~~text
CAN-5.10: Recovery-Dashboard optisch prüfen und stabil dokumentieren
~~~

Zu prüfen:

~~~text
Recovery-Quelle wirkt kompakt
State-Werte sind lesbar
Keine Test-Buttons sichtbar
Read-only-Hinweis ist sichtbar
Dashboard wirkt nicht mehr wie Debug-Output
~~~

Regeln bleiben:

~~~text
Keine Simulation per Dashboard
Keine Recovery-Automatik
Keine produktive Flow-Änderung
~~~

## Nach STEP CAN-5.9.1

Marker: STEP_CAN5_9_1_NEXT_STEPS

CAN-5.9.1 verbessert die Lesbarkeit des Recovery-Tabs, ohne produktive Logik zu ändern.

Nächster sinnvoller Schritt:

~~~text
CAN-5.10: Dashboard-Recovery-Tab live prüfen und stabil dokumentieren
~~~

Zu prüfen:

~~~text
Tab Recovery sichtbar
Recovery-Quelle lesbar
lange State-Werte brechen nicht störend um
Keine Simulation-Buttons sichtbar
Keine Recovery-Automatik vorhanden
~~~

Regel bleibt:

~~~text
Nur Anzeige-Logik
Keine produktive Flow-Änderung
~~~

## Nach STEP CAN-5.9

Marker: STEP_CAN5_9_NEXT_STEPS

CAN-5.9 macht die Recovery-Diagnose im Bus-Diagnostics-Dashboard read-only sichtbar.

Nächster sinnvoller Schritt:

~~~text
CAN-5.10: Dashboard-Recovery-Tab live prüfen und stabil dokumentieren
~~~

Zu prüfen:

~~~text
Bus-Diagnostics-Dashboard lädt
Tab Recovery sichtbar
Recovery-State wird angezeigt
blockedActions werden angezeigt
Sicherheitsflags bleiben false/aus
Keine Simulation-Buttons vorhanden
Keine Recovery-Automatik vorhanden
~~~

Regel bleibt:

~~~text
Keine Simulation per Dashboard auslösen
Keine produktive Flow-Änderung
~~~
