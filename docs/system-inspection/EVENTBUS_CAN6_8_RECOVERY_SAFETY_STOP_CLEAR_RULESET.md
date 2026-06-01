# EVENTBUS CAN-6.8 RECOVERY-SAFETY-STOP- UND CLEAR-REGELWERK

Stand: 2026-06-01
Status: Plan / Sicherheitskonzept / keine Umsetzung
Marker: STEP_CAN6_8_RECOVERY_SAFETY_STOP_CLEAR_RULESET

## Ausgangslage

CAN-6.1 hat die manuelle Recovery-Aktionsmatrix definiert.
CAN-6.2 hat den Backend-Schutzvertrag geplant.
CAN-6.3 hat Audit- und Bestätigungs-Code-Konzept beschrieben.
CAN-6.4 hat das read-only Preflight-API-Konzept definiert.
CAN-6.5 hat die read-only Dashboard-UX fuer Preflight-Ergebnisse geplant.
CAN-6.6 hat den spaeteren Ausfuehrungs-Command als Konzept beschrieben.
CAN-6.7 hat das Command-/Audit-/State-Mapping festgelegt.

CAN-6.8 definiert jetzt nur das Regelwerk fuer Safety-Stop, Clear, Review und Rollback-Hinweise.

Wichtig: CAN-6.8 baut keine Route, keinen Button, keinen Speicher, keine DB-Tabelle und keine Recovery-Ausfuehrung.

~~~text
Keine Backend-Änderung
Keine API-Route aktivieren
Keine Dashboard-Code-Änderung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

## Ziel von CAN-6.8

Ziel ist ein klares Sicherheitsregelwerk, damit spaetere Low-Risk-Recovery-Aktionen niemals versehentlich produktive Alerts, Sounds oder Overlays erneut ausloesen.

CAN-6.8 legt fest:

~~~text
Safety-Stop-Arten
Globale Stopps
Modulbezogene Stopps
Clear-/Review-/Rollback-Trennung
Low-Risk-Clear-Grenzen
hart blockierte Clear-/Recovery-Aktionen
Dashboard-Hinweise ohne Aktion
Testregeln fuer spaetere Code-Steps
~~~

## Begriffe

~~~text
Safety-Stop:
  Sperre, die Recovery-Aktionen verhindert, bevor riskante Zustaende geklaert sind.

Globaler Safety-Stop:
  Sperre fuer alle Recovery-Aktionen im gesamten Recovery-Kontext.

Modul-Safety-Stop:
  Sperre fuer ein betroffenes Modul, z. B. Alert-System, Sound-System oder Overlay-Client.

Clear:
  Geplanter spaeterer Verwaltungsakt, der einen alten Diagnose-/Wait-/Review-Zustand als erledigt markieren kann.

Review:
  Menschliche Pruefung ohne automatische technische Aktion.

Rollback-Hinweis:
  Anzeige, welche manuelle Ruecknahme oder welcher Neustart sinnvoll waere, ohne diesen automatisch auszufuehren.
~~~

## Safety-Stop-Arten

Spaeter duerfen nur klar benannte Safety-Stop-Arten verwendet werden:

~~~text
recovery_global_stop
recovery_module_stop
alert_flow_stop
sound_flow_stop
overlay_flow_stop
bundle_lock_stop
queue_integrity_stop
audit_failure_stop
confirmation_failure_stop
duplicate_guard_stop
unknown_state_stop
~~~

Regel:

~~~text
Ein Safety-Stop blockiert immer.
Ein Safety-Stop startet niemals automatisch einen Clear.
Ein Safety-Stop startet niemals automatisch Recovery.
Ein Safety-Stop darf nur durch explizit geplante Admin-/Owner-Aktion bewertet werden.
~~~

## Globale Stopps

Globale Stopps betreffen alle spaeteren Recovery-Aktionen:

| Stop | Bedeutung | Spaetere Wirkung |
|---|---|---|
| recovery_global_stop | Recovery ist vollstaendig gesperrt | alle Commands blockieren |
| audit_failure_stop | Audit kann nicht sicher schreiben | alle mutierenden Aktionen blockieren |
| unknown_state_stop | Zustand ist nicht eindeutig | alle Aktionen blockieren |
| duplicate_guard_stop | Duplikat-Sperre ist unklar oder verletzt | alle Ausgabe-nahen Aktionen blockieren |

Globale Stopps duerfen nicht automatisch aufgehoben werden.

## Modulbezogene Stopps

Modulstopps betreffen nur den jeweiligen Bereich, duerfen aber bei Abhaengigkeiten andere Aktionen blockieren:

| Stop | Modulbereich | Spaetere Wirkung |
|---|---|---|
| alert_flow_stop | Alert-System | keine Alert-nahe Aktion erlauben |
| sound_flow_stop | Sound-System | keine Sound-nahe Aktion erlauben |
| overlay_flow_stop | Overlay-Client | keine Overlay-nahe Aktion erlauben |
| bundle_lock_stop | Alert/Sound-Bundle | Bundle-bezogene Aktionen blockieren |
| queue_integrity_stop | Queue-/Job-Zustand | Queue-nahe Aktionen blockieren |

Regel:

~~~text
Ein Modulstopp darf nur Aktionen dieses Moduls oder direkt abhängige Aktionen betreffen.
Wenn die Abhaengigkeit unklar ist, muss unknown_state_stop greifen.
~~~

## Clear-/Review-/Rollback-Trennung

Diese Begriffe duerfen spaeter nicht vermischt werden:

| Begriff | Darf Zustand markieren | Darf produktiv ausloesen | Braucht Audit | Braucht Owner/Admin |
|---|---:|---:|---:|---:|
| Review | ja, nur als gesehen/geprueft | nein | ja | ja |
| Clear-Hinweis | nein, nur Anzeige | nein | nein | nein |
| Clear-Anforderung | ja, nur nach Guard | nein | ja | ja |
| Rollback-Hinweis | nein, nur Anzeige | nein | nein | nein |
| Rollback-Ausfuehrung | vorerst blockiert | nein | ja | ja |

Wichtig:

~~~text
Clear ist keine Recovery.
Clear ist kein Replay.
Clear ist kein Retry.
Clear darf keine neue Ausgabe starten.
Clear darf keine Queue neu starten.
Clear darf keinen Sound starten.
Clear darf keinen Alert erneut ausgeben.
~~~

## Low-Risk-Clear-Aktionen als spaeteres Konzept

Folgende Aktionen koennen spaeter als Low-Risk geplant werden, aber erst nach separatem Code-Step:

~~~text
mark_recovery_reviewed
clear_stale_visual_wait
clear_stale_preflight_result
clear_stale_command_result
request_status_recheck
~~~

Grenzen:

~~~text
nur Owner/Admin
nur nach Preflight
nur mit Bestätigungs-Code, falls Zustand veraendert wird
nur mit Audit
nur wenn keine produktive Ausgabe gestartet wird
nur wenn kein aktiver Alert/Sound/Bundle-Lock laeuft
~~~

## Weiterhin hart blockiert

Diese Aktionen bleiben blockiert:

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
clear_and_replay
clear_and_retry
clear_and_restart_queue
clear_and_start_sound
clear_and_emit_alert
~~~

Regel:

~~~text
Kein Clear darf mit Replay/Retry/Start kombiniert werden.
Wenn eine Aktion mehr als Markieren/Pruefen/Clearen macht, ist sie keine Low-Risk-Aktion.
~~~

## Dashboard-Hinweise ohne Aktion

Das Dashboard darf spaeter read-only anzeigen:

~~~text
aktiver globaler Safety-Stop
aktiver Modul-Safety-Stop
blockierte Aktion
Blockierungsgrund
Clear moeglich: ja/nein
Review noetig: ja/nein
Rollback-Hinweis vorhanden: ja/nein
naechster sicherer Schritt als Text
~~~

Nicht anzeigen/ausloesen ohne separaten Code-Step:

~~~text
kein Clear-Button
kein Recovery-Button
kein Replay-Button
kein Retry-Button
kein Auto-Clear
kein Auto-Review
kein Auto-Rollback
~~~

## Standardisierte Blockierungsgruende

CAN-6.8 erweitert die Blockierungsgruende aus CAN-6.7 um Safety-/Clear-Gruende:

~~~text
blocked_global_safety_stop
blocked_module_safety_stop
blocked_audit_unavailable
blocked_unknown_state
blocked_duplicate_guard
blocked_active_bundle_lock
blocked_active_alert_or_sound
blocked_clear_not_low_risk
blocked_clear_requires_review
blocked_clear_requires_owner_admin
blocked_clear_requires_confirmation
blocked_clear_would_trigger_output
blocked_rollback_not_supported
~~~

## Testregeln fuer spaetere Code-Steps

Bevor CAN-6.8-Regeln spaeter in Code umgesetzt werden, muessen mindestens diese Tests definiert werden:

~~~text
Globaler Safety-Stop blockiert alle Commands.
Modul-Safety-Stop blockiert nur relevante Commands.
Audit-Ausfall blockiert alle mutierenden Aktionen.
Clear ohne Owner/Admin wird blockiert.
Clear ohne Bestätigungs-Code wird blockiert, wenn Zustand geaendert wuerde.
Clear bei aktivem Alert/Sound wird blockiert.
Clear bei aktivem Bundle-Lock wird blockiert.
Clear startet keinen Alert.
Clear startet keinen Sound.
Clear startet kein Overlay.
Clear manipuliert keine Queue.
Rollback-Hinweis bleibt Anzeige und fuehrt nichts aus.
Dashboard zeigt Hinweise read-only.
~~~

## Nicht geändert

~~~text
Keine Backend-Änderung
Keine API-Änderung
Keine Dashboard-Code-Änderung
Keine Overlay-Änderung
Keine Config-Änderung
Keine DB-/Config-Migration
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Änderung
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-6.9: Recovery-Implementierungsreihenfolge und erste Code-Step-Grenzen planen
~~~

CAN-6.9 soll noch nicht implementieren, sondern festlegen, welche echte Datei spaeter zuerst geprueft wird und welcher minimale read-only Code-Step ueberhaupt erlaubt waere.
