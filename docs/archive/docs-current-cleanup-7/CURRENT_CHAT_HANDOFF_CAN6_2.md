# CURRENT CHAT HANDOFF – CAN-6.2 Backend-Schutzvertrag

Stand: 2026-06-01
Marker: STEP_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT

## Kurzstatus

CAN-6.2 wurde als reiner Doku-/Planungsstep erstellt.

Der Step definiert den Backend-Schutzvertrag fuer spaetere manuelle Recovery-Aktionen.

## Stabiler Stand

~~~text
CAN-5.5 bis CAN-5.10: stabiler read-only Diagnose-Stand
CAN-6.0: Sicherheitsplanung fuer spaetere manuelle Recovery
CAN-6.1: manuelle Recovery-Aktionsmatrix definiert
CAN-6.2: Backend-Schutzvertrag definiert
~~~

## Wichtig

CAN-6.2 aktiviert nichts.

~~~text
Keine Backend-Aenderung
Keine API-Aenderung
Keine Dashboard-Code-Aenderung
Keine neuen Routen
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Aenderung
Keine DB-/Config-Migration
~~~

## Definierte Schutzschichten

~~~text
AuthGuard
ActionMatrixGuard
ConfirmGuard
RecoveryStateGuard
SafetyStopGuard
StatusGuard
DuplicateGuard
RateLimitGuard
AuditGuard
RollbackGuard
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

## Neue Hauptdoku

~~~text
docs/system-inspection/EVENTBUS_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT.md
~~~

## Naechster sinnvoller Schritt

~~~text
CAN-6.3: Recovery-Audit- und Confirm-Token-Konzept planen
~~~

CAN-6.3 soll weiterhin keine produktive Recovery aktivieren.

Vor Code zuerst klären:

~~~text
Welche Audit-Events braucht Recovery genau?
Wie sieht ein Confirm-Token-Lebenszyklus aus?
Welche Preflight-Felder muss das Backend liefern?
Wie wird Token-Wiederverwendung verhindert?
Wie werden Rollen, Aktion, IDs und Ablaufzeit an das Token gebunden?
Welche Audit-Fehler blockieren Aktionen hart?
Welche DB-/Storage-Struktur waere spaeter noetig, ohne produktive DB blind zu migrieren?
~~~

## Arbeitsregel

Keine Apply-Scripte / keine Patch-Scripte verwenden.

Gewuenschte Arbeitsweise:

~~~text
1. Echte aktuelle Dateien pruefen.
2. Falls Dateien fehlen: konkret anfordern.
3. Direkte Ersatzdateien liefern oder exakte Austauschstellen nennen.
4. Keine Funktionalitaet entfernen.
5. Keine produktiven Flows ohne ausdrueckliches Go aendern.
~~~
