# CURRENT CHAT HANDOFF – CAN-6.3 Recovery Audit / Bestätigungs-Code

Stand: 2026-06-01

## Kurzstatus

CAN-6.3 ist als reiner Planungs-/Doku-Step abgeschlossen.

~~~text
CAN-6.1: Manuelle Recovery-Aktionsmatrix definiert
CAN-6.2: Backend-Schutzvertrag / Guard-Kette definiert
CAN-6.3: Audit- und Bestätigungs-Code-Konzept definiert
~~~

## Was CAN-6.3 definiert

~~~text
Audit-Eventtypen
Audit-Pflichtfelder
Bestätigungs-Code-Lebenszyklus
Bestätigungs-Code-Bindung an User/Rolle/Aktion/IDs
Preflight-Antwortfelder
Bestätigungs-Code-Wiederverwendungsschutz
blockierende Audit-Fehler
konzeptionelle Storage-/DB-Struktur
~~~

## Weiterhin nicht aktiv

~~~text
Keine Backend-Aenderung
Keine API-Aenderung
Keine Dashboard-Code-Aenderung
Keine neuen Routen
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine Auto-Recovery
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Aenderung
Keine DB-/Config-Migration
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

## Wichtigste Regel aus CAN-6.3

~~~text
Preflight erzeugt nur Vorschau und optional kurzlebiges Bestätigungs-Code.
Confirm muss alle Guards erneut pruefen.
Ein Bestätigungs-Code ist keine Berechtigung allein.
Ein Bestätigungs-Code darf niemals Replay-/Auto-Recovery-Sperren umgehen.
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-6.4: Read-only Recovery-Preflight-API-Konzept planen
~~~

Vor Code zuerst klaeren:

~~~text
Welche Preflight-Daten duerfte eine spaetere API read-only liefern?
Welche Guards laufen im Preflight nur pruefend?
Welche Felder muessen fuer Dashboard-Anzeige vorhanden sein?
Welche Fehler duerfen nur Anzeige sein?
Welche Fehler blockieren Bestätigungs-Code-Erzeugung?
Wie bleibt Preflight garantiert ohne produktive Wirkung?
~~~

## Arbeitsregel

Keine Apply-Scripte / keine Patch-Scripte fuer diesen Bereich verwenden.

Gewuenschte Arbeitsweise:

~~~text
1. Echte aktuelle Dateien pruefen.
2. Falls Dateien fehlen: konkret anfordern.
3. Direkte Ersatzdateien liefern oder exakte Austauschstellen nennen.
4. Keine Funktionalitaet entfernen.
5. Keine produktiven Flows ohne ausdrueckliches Go aendern.
~~~
