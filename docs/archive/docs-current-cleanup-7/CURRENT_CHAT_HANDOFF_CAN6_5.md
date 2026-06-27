# CURRENT CHAT HANDOFF – CAN-6.5 Dashboard Preflight Read-only UX Concept

Stand: 2026-06-01
Marker: STEP_CAN6_5_DASHBOARD_PREFLIGHT_READONLY_UX_CONCEPT

## Kurzstatus

CAN-6.5 ist als reiner Dokumentations-/Planungsstep abgeschlossen.

Es wurde geplant, wie spaetere Recovery-Preflight-Daten im Dashboard sicher, eindeutig und read-only angezeigt werden duerfen.

## Ergebnis

Definiert wurde:

~~~text
sichtbare Preflight-Felder
Dashboard-Anzeigegruppen
Status-Einstufungen
Pflichttexte gegen Fehlbedienung
verbotene UI-Elemente
Rollen-/Rechte-Hinweise
Bestätigungs-Code nur als Verfügbarkeitsstatus
Dashboard-Datenmodell als Konzept
CAN-6.1-Aktionen aus Dashboard-Sicht
Testregeln fuer spaeteren Code-Step
~~~

## Weiterhin nicht aktiv

~~~text
Keine Backend-Änderung
Keine API-Route aktiv
Keine Dashboard-Code-Änderung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine automatische Recovery
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

## Wichtigste Sicherheitsregel

CAN-6.5 plant nur die Darstellung.

Das Dashboard darf spaeter in dieser Phase nur anzeigen:

~~~text
Preflight-Status
Blockaden
Warnungen
Rollenhinweise
Read-only-Hinweise
~~~

Es darf nicht auslösen:

~~~text
Recovery
Replay
Retry
Simulation
Queue-/Lock-Manipulation
Bestätigungs-Code-Erzeugung
Safety-Stop-Deaktivierung
~~~

## Neue Datei

~~~text
docs/system-inspection/EVENTBUS_CAN6_5_DASHBOARD_PREFLIGHT_READONLY_UX_CONCEPT.md
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-6.6: Read-only Dashboard-Preflight-Anzeige als Code-Step planen
~~~

Vor Code weiterhin:

~~~text
Echte Repo-Dateien prüfen.
Keine Route bauen ohne separates Go.
Keine Buttons bauen ohne separates Go.
Keine produktive Recovery aktivieren.
Keine Funktionalität entfernen.
~~~
