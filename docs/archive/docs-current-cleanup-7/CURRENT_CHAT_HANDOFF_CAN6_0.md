# CURRENT CHAT HANDOFF – CAN-6.0 Recovery Planning

Stand: 2026-06-01

## Kurzstatus

Der Communication-Bus-/Recovery-Diagnose-Strang ist bis CAN-6.0 dokumentiert und stabil abgeschlossen.

Aktueller stabiler Diagnose-Stand:

~~~text
CAN-5.5 bis CAN-5.10: stabiler read-only Diagnose-Stand
CAN-6.0: Planung fuer spaetere abgesicherte manuelle Recovery
~~~

## Was technisch stabil ist

~~~text
bus_diagnostics: 1.2.4
Recovery-Strategy-State: read-only
Simulation-Harness: synthetisch/read-only
Dashboard-Recovery-Tab: read-only Anzeige
Keine Simulation-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Aenderung
~~~

## Geprüfte Recovery-Simulationen

~~~text
missingAck -> blocked_missing_visual_ack
noClient   -> blocked_no_overlay_client
unmatched  -> blocked_unmatched_alert_sound
~~~

## Dashboard-Status

Der Bus-Diagnostics-Recovery-Tab wurde aufgebaut, optisch bereinigt und als stabil abgenommen.

Sichtbar sind:

~~~text
Recovery-Strategie
Sicherheitsstatus
Recovery-Quelle
Blockierte Aktionen
Erlaubte Aktionen
Gruende
Simulation-Harness
Read-only-Hinweise
~~~

Nicht sichtbar / nicht vorhanden:

~~~text
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine Auto-Recovery
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
~~~

## CAN-6.0 Regel

CAN-6.0 ist nur Planung und Sicherheitskonzept.

~~~text
Keine Backend-Aenderung
Keine API-Aenderung
Keine Dashboard-Code-Aenderung
Keine produktive Flow-Aenderung
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-6.1: Manuelle Recovery-Aktionsmatrix definieren
~~~

Vor Code zuerst klären:

~~~text
Welche Zustaende bleiben reine Diagnose?
Welche Aktionen duerfen spaeter manuell bestaetigt werden?
Welche Aktionen bleiben hart blockiert?
Welche Rechte sind noetig?
Welche Audit-Logs sind Pflicht?
Welche Duplikat-Sperren schuetzen Alert/Sound/Overlay?
Wie wird Safety-Stop/Rollback umgesetzt?
~~~

## Wichtige Arbeitsregel für den nächsten Chat

Keine Apply-Scripte / keine Patch-Scripte fuer diesen Bereich verwenden.

Gewuenschte Arbeitsweise:

~~~text
1. Echte aktuelle Dateien pruefen.
2. Falls Dateien fehlen: konkret anfordern.
3. Direkte Ersatzdateien liefern oder exakte Austauschstellen nennen.
4. Keine Funktionalitaet entfernen.
5. Keine produktiven Flows ohne ausdrueckliches Go aendern.
~~~
