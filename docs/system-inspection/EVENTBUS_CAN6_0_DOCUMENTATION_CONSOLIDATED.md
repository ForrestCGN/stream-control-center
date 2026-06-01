# EVENTBUS CAN-6.0 DOCUMENTATION CONSOLIDATED

Stand: 2026-06-01
Status: Dokumentationsabschluss / Übergabe

## Zweck

Dieser Stand konsolidiert den aktuellen Recovery-Diagnose- und CAN-6.0 Planungsstand.

## Ergebnis

~~~text
CAN-5.5 bis CAN-5.10: stabiler read-only Diagnose-Stand
CAN-6.0: reine Planung fuer abgesicherte manuelle Recovery
~~~

## Sicherheitsgrenzen

~~~text
Keine automatische Recovery
Keine Simulation-Buttons
Keine Recovery-Buttons
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Aenderung
~~~

## Relevante Dateien

~~~text
backend/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.js
docs/system-inspection/EVENTBUS_CAN6_0_MANUAL_RECOVERY_PLANNING.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
TODO.md
CHANGELOG.md
FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN6_0.md
~~~

## Nächster Schritt

~~~text
CAN-6.1: Manuelle Recovery-Aktionsmatrix definieren
~~~

CAN-6.1 soll noch keinen produktiven Code aktivieren, sondern nur sauber festlegen:

~~~text
Zustand
manuell erlaubte Aktion
hart blockierte Aktion
Berechtigung
Audit-Log
Duplikat-Sperre
Safety-Stop
Rollback
~~~
