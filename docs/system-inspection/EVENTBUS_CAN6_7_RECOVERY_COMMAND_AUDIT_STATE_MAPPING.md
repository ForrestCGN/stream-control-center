# EVENTBUS CAN-6.7 RECOVERY-COMMAND-AUDIT-/STATE-MAPPING

Stand: 2026-06-01
Status: Plan / Sicherheitskonzept / keine Umsetzung
Marker: STEP_CAN6_7_RECOVERY_COMMAND_AUDIT_STATE_MAPPING

## Ausgangslage

CAN-6.1 hat die manuelle Recovery-Aktionsmatrix definiert.
CAN-6.2 hat den Backend-Schutzvertrag geplant.
CAN-6.3 hat Audit- und Bestätigungs-Code-Konzept beschrieben.
CAN-6.4 hat das read-only Preflight-API-Konzept definiert.
CAN-6.5 hat die read-only Dashboard-UX fuer Preflight-Ergebnisse geplant.
CAN-6.6 hat den spaeteren Ausfuehrungs-Command als Konzept beschrieben.

CAN-6.7 definiert jetzt nur das Mapping zwischen spaeterem Command-Zustand, Audit-Ereignis, Diagnose-State und Dashboard-Anzeige.

Wichtig: CAN-6.7 baut keine Route, keinen Button, keinen Speicher, keine DB-Tabelle und keine Recovery-Ausfuehrung.

~~~text
Keine Backend-Änderung
Keine API-Route aktivieren
Keine Dashboard-Code-Änderung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

## Ziel von CAN-6.7

Ziel ist ein einheitliches Vokabular, damit spaetere Backend- und Dashboard-Steps dieselben Zustaende und Audit-Ereignisse verwenden.

CAN-6.7 legt fest:

~~~text
Command-Zustaende
Audit-Ereignisse pro Zustand
State-Felder fuer spaetere Diagnose
Blockierungsgruende
Dashboard-Anzeige nach Preflight/Command
Rollback-/Clear-Hinweise ohne automatische Ausfuehrung
~~~

## Command-Zustaende

Spaetere Recovery-Commands duerfen nur diese Zustandsfamilien verwenden:

~~~text
not_requested
preflight_required
preflight_blocked
preflight_allowed
confirmation_required
confirmation_invalid
confirmation_expired
command_requested
guard_blocked
safety_stop_blocked
duplicate_blocked
execution_skipped
execution_started
execution_succeeded
execution_failed
rollback_required
review_required
cleared_by_admin
~~~

Regel:

~~~text
Jeder Zustand muss eindeutig sein.
Jeder blockierende Zustand braucht blockReasons.
Jeder mutierende Zustand braucht Audit.
Jeder Fehlerzustand braucht rollbackHint oder reviewHint.
~~~

## Audit-Ereignisse

Spaetere Audit-Ereignisse sollen klein, maschinenlesbar und eindeutig bleiben.

~~~text
recovery.preflight.requested
recovery.preflight.allowed
recovery.preflight.blocked
recovery.confirmation.created
recovery.confirmation.rejected
recovery.command.requested
recovery.command.guard_blocked
recovery.command.safety_stop_blocked
recovery.command.duplicate_blocked
recovery.command.execution_started
recovery.command.execution_succeeded
recovery.command.execution_failed
recovery.command.rollback_required
recovery.command.review_required
recovery.command.cleared
~~~

Keine Audit-Zeile darf sensible Werte im Klartext speichern.

## Mapping: Zustand -> Audit -> Anzeige

| Zustand | Audit-Ereignis | Dashboard-Anzeige | Aktion |
|---|---|---|---|
| `not_requested` | keins | Keine manuelle Recovery angefragt | Nur Anzeige |
| `preflight_required` | `recovery.preflight.requested` | Vorprüfung erforderlich | Nur Anzeige |
| `preflight_blocked` | `recovery.preflight.blocked` | Vorprüfung blockiert | Keine Ausführung |
| `preflight_allowed` | `recovery.preflight.allowed` | Vorprüfung erlaubt Low-Risk-Aktion | Keine automatische Ausführung |
| `confirmation_required` | `recovery.confirmation.created` | Bestätigung erforderlich | Kein Execute ohne Code |
| `confirmation_invalid` | `recovery.confirmation.rejected` | Bestätigung abgelehnt | Blockiert |
| `confirmation_expired` | `recovery.confirmation.rejected` | Bestätigung abgelaufen | Blockiert |
| `command_requested` | `recovery.command.requested` | Command angefragt | Guard-Kette erforderlich |
| `guard_blocked` | `recovery.command.guard_blocked` | Guard blockiert | Keine Ausführung |
| `safety_stop_blocked` | `recovery.command.safety_stop_blocked` | Safety-Stop aktiv | Keine Ausführung |
| `duplicate_blocked` | `recovery.command.duplicate_blocked` | Duplikat-Sperre aktiv | Keine Ausführung |
| `execution_skipped` | `recovery.command.guard_blocked` | Ausführung übersprungen | Keine Ausführung |
| `execution_started` | `recovery.command.execution_started` | Ausführung gestartet | Nur Low-Risk |
| `execution_succeeded` | `recovery.command.execution_succeeded` | Ausführung erfolgreich | Audit-Pflicht |
| `execution_failed` | `recovery.command.execution_failed` | Ausführung fehlgeschlagen | Review/Rollback-Hinweis |
| `rollback_required` | `recovery.command.rollback_required` | Manuelle Prüfung nötig | Keine Automatik |
| `review_required` | `recovery.command.review_required` | Admin-Review nötig | Keine Automatik |
| `cleared_by_admin` | `recovery.command.cleared` | Zustand manuell bereinigt | Audit-Pflicht |

## Geplante State-Felder

Ein spaeterer State darf nur Diagnose- und Nachvollziehbarkeitsdaten speichern.

~~~text
lastRecoveryCommandState
lastRecoveryCommandAction
lastRecoveryCommandResult
lastRecoveryCommandRequestedBy
lastRecoveryCommandRequestedRole
lastRecoveryCommandAt
lastRecoveryCommandAuditId
lastRecoveryCommandBlockReasons
lastRecoveryCommandWarnings
lastRecoveryCommandRollbackHint
lastRecoveryCommandReviewHint
lastRecoveryCommandClientRequestId
lastRecoveryCommandPreflightId
~~~

Regeln:

~~~text
Keine sensiblen Bestätigungswerte speichern.
Keine Sound-/Alert-Replay-Freigabe speichern.
Keine automatische Retry-Absicht speichern.
Keine produktive Ausführung aus State ableiten.
State ist Diagnose, nicht Trigger.
~~~

## Standardisierte Blockierungsgruende

Blockierungsgruende muessen spaeter stabil bleiben, damit Dashboard, Logs und Tests dieselben Begriffe nutzen.

~~~text
blocked_no_auth
blocked_not_owner_admin
blocked_action_not_allowed
blocked_action_hard_blocked
blocked_preflight_missing
blocked_preflight_mismatch
blocked_confirmation_missing
blocked_confirmation_invalid
blocked_confirmation_expired
blocked_safety_stop_active
blocked_module_stop_active
blocked_duplicate_request
blocked_bundle_lock_active
blocked_alert_running
blocked_sound_running
blocked_overlay_client_missing
blocked_audit_unavailable
blocked_state_stale
blocked_unknown_target
blocked_internal_error
~~~

## Dashboard-Anzeige

Dashboard darf spaeter nur anzeigen:

~~~text
aktueller Recovery-Command-Zustand
letztes Audit-Ereignis
Blockierungsgruende
Warnungen
Rollback-/Review-Hinweis
Safety-Stop-Status
Duplikat-Sperren-Status
Zeitpunkt der letzten Pruefung
~~~

Dashboard darf in CAN-6.7 weiterhin nicht anzeigen:

~~~text
keinen Execute-Button
keinen Replay-Button
keinen Sound-Start-Button
keinen Alert-Replay-Button
keinen Auto-Recovery-Schalter
keine Simulation-Aktion
~~~

## Rollback-/Clear-Hinweise

Rollback bleibt manuell und muss spaeter explizit geplant werden.

CAN-6.7 erlaubt nur Hinweise:

~~~text
rollbackHint
reviewHint
clearHint
manualOnly=true
requiresOwnerAdmin=true
requiresAudit=true
~~~

Nicht erlaubt:

~~~text
automatischer Rollback
automatisches Clear
automatischer Retry
automatisches Replay
automatisches Queue-Unlock ohne separate Planung
~~~

## Testregeln fuer spaetere Code-Steps

Ein spaeterer Code-Step muss mindestens pruefen:

~~~text
alle Zustaende sind dokumentiert
alle Audit-Ereignisse sind dokumentiert
alle blockReasons sind stabil
Dashboard zeigt nur read-only Daten
keine Buttons vorhanden
keine produktive Route aktiv, solange nicht separat freigegeben
Safety-Stop blockiert Command
Duplikat-Sperre blockiert zweiten Request
Audit-Fehler blockiert mutierende Aktion
~~~

## Nicht geändert

~~~text
Keine Backend-Logik geändert.
Keine API-Route ergänzt.
Keine Dashboard-Datei geändert.
Keine Recovery-Buttons ergänzt.
Keine Simulation-Buttons ergänzt.
Keine Recovery-Automatik aktiviert.
Keine Queue-/Sound-/Overlay-Logik geändert.
Keine DB-/Config-Migration.
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-6.8: Recovery-Safety-Stop- und Clear-Regelwerk planen
~~~
