# CURRENT CHAT HANDOFF – CAN-6.4 Recovery Preflight API Concept

Stand: 2026-06-01
Marker: STEP_CAN6_4_READONLY_RECOVERY_PREFLIGHT_API_CONCEPT

## Kurzstatus

CAN-6.4 ist als reiner Dokumentations-/Planungsstep abgeschlossen.

Es wurde ein Konzept für eine spätere read-only Recovery-Preflight-API definiert.

## Ergebnis

Definiert wurde:

~~~text
spätere Preflight-Route nur als Konzept
Request-Felder
Response-Felder
read-only Guard-Prüfungen
Blockierungsgründe
Warnungsgründe
Bestätigungs-Code-Verfügbarkeit im Preflight
Read-only-Garantie
Dashboard-Anzeigefelder
Preflight-Einstufung der CAN-6.1-Aktionen
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

Preflight darf später nur prüfen und anzeigen.

Preflight darf niemals:

~~~text
Queues ändern
Locks setzen oder lösen
Sounds starten
Alerts starten
Overlays triggern
produktive EventBus-Events senden
Recovery ausführen
~~~

## Neue Datei

~~~text
docs/system-inspection/EVENTBUS_CAN6_4_READONLY_RECOVERY_PREFLIGHT_API_CONCEPT.md
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-6.5: Dashboard-Preflight-Anzeige und UX-Regeln planen
~~~

Vor Code weiterhin:

~~~text
Echte Repo-Dateien prüfen.
Keine Route bauen ohne separates Go.
Keine Buttons bauen ohne separates Go.
Keine produktive Recovery aktivieren.
Keine Funktionalität entfernen.
~~~
