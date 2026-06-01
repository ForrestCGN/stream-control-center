# CURRENT CHAT HANDOFF – CAN-6.1 Recovery Action Matrix

Stand: 2026-06-01
Marker: STEP_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX

## Kurzstatus

CAN-6.1 wurde als reiner Planungs-/Doku-Step definiert.

Der Communication-Bus-/Recovery-Diagnose-Strang bleibt weiterhin read-only.

~~~text
CAN-5.5 bis CAN-5.10: stabiler read-only Diagnose-Stand
CAN-6.0: Planung fuer spaetere abgesicherte manuelle Recovery
CAN-6.1: manuelle Recovery-Aktionsmatrix definiert
~~~

## Was CAN-6.1 festlegt

CAN-6.1 definiert fuer bekannte Recovery-Zustaende:

~~~text
Aktionsklasse
spaeter eventuell manuell erlaubte Aktion
hart blockierte Aktionen
Berechtigung
Audit-Pflicht
Duplikat-Sperre
Safety-Stop
Rollback-/Clear-Regel
~~~

Zentrale Datei:

~~~text
docs/system-inspection/EVENTBUS_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX.md
~~~

## Bekannte Zustände in der Matrix

~~~text
missingAck
noClient
unmatched
waitingTooLong
soundFetchFailed
bundle_wait_timeout
overlay_watchdog_issue
unbekannter Recovery-State
~~~

## Weiterhin hart blockiert

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
~~~

## Wichtig

Auch nach CAN-6.1 gibt es weiterhin:

~~~text
Keine Backend-Aenderung
Keine API-Aenderung
Keine Dashboard-Code-Aenderung
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Aenderung
Keine DB-/Config-Migration
~~~

## Naechster sinnvoller Schritt

~~~text
CAN-6.2: Backend-Schutzvertrag fuer manuelle Recovery planen
~~~

CAN-6.2 soll noch keine produktive Recovery aktivieren.

Vor Code zuerst klaeren:

~~~text
Welche Auth-/Owner-Admin-Pruefung wird verwendet?
Wo wird Audit-Logging spaeter zentral angebunden?
Wie sieht der globale Recovery-Safety-Stop aus?
Welche Status-Guards pruefen laufende Alerts/Sounds/Bundles?
Wie werden Duplikat-Sperren technisch gespeichert?
Welche Routen bleiben read-only?
Welche Routen waeren spaeter nur mit Confirm erlaubt?
~~~

## Wichtige Arbeitsregel

Keine Apply-Scripte / keine Patch-Scripte fuer diesen Bereich verwenden.

Gewuenschte Arbeitsweise:

~~~text
1. Echte aktuelle Dateien pruefen.
2. Falls Dateien fehlen: konkret anfordern.
3. Direkte Ersatzdateien liefern oder exakte Austauschstellen nennen.
4. Keine Funktionalitaet entfernen.
5. Keine produktiven Flows ohne ausdrueckliches Go aendern.
~~~
