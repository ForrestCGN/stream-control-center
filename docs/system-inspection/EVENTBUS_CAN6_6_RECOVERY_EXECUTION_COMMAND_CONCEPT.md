# EVENTBUS CAN-6.6 RECOVERY-AUSFUEHRUNGS-COMMAND-KONZEPT

Stand: 2026-06-01
Status: Plan / Sicherheitskonzept / keine Umsetzung
Marker: STEP_CAN6_6_RECOVERY_EXECUTION_COMMAND_CONCEPT

## Ausgangslage

CAN-6.1 hat die manuelle Recovery-Aktionsmatrix definiert.
CAN-6.2 hat den Backend-Schutzvertrag geplant.
CAN-6.3 hat Audit- und Bestätigungs-Code-Konzept beschrieben.
CAN-6.4 hat ein Konzept fuer eine spaetere read-only Recovery-Preflight-API definiert.
CAN-6.5 hat geplant, wie Preflight-Ergebnisse spaeter im Dashboard read-only angezeigt werden duerfen.

CAN-6.6 plant jetzt nur den spaeteren Ausfuehrungs-Command als Sicherheitsvertrag.

Wichtig: CAN-6.6 baut keinen Command, keine Route, keinen Button und keine Recovery-Ausfuehrung.

~~~text
Keine Backend-Änderung
Keine API-Route aktivieren
Keine Dashboard-Code-Änderung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

## Ziel von CAN-6.6

CAN-6.6 legt fest, wie ein spaeterer manueller Recovery-Ausfuehrungs-Command aussehen muss, falls er in einem separaten Code-Step gebaut wird.

Der Command darf spaeter nur nach erfolgreichem Preflight, Owner/Admin-Rechten, Bestätigungs-Code, Guard-Kette, Audit-Start und Duplikat-Sperre arbeiten.

~~~text
Preflight muss vorher erfolgreich gewesen sein
Bestätigungs-Code muss gueltig und unverbraucht sein
User/Rolle/Aktion/IDs muessen zur Preflight-Pruefung passen
Safety-Stop darf nicht aktiv sein
Duplikat-Sperre muss greifen
Audit muss vor und nach der Aktion schreiben
Rollback-/Clear-Regel muss bekannt sein
produktive Ausgabe bleibt fuer riskante Aktionen weiterhin blockiert
~~~

## Strikte Trennung: Preflight vs. Command

Preflight bleibt read-only.

Der spaetere Command waere die erste Stelle, an der ueberhaupt eine manuelle Aktion ausgefuehrt werden koennte.

Deshalb gilt:

~~~text
Preflight darf nie mutieren.
Command darf nur nach neuer Guard-Pruefung mutieren.
Command darf Preflight-Ergebnis nicht blind vertrauen.
Command muss alle Sicherheitsdaten erneut pruefen.
Command muss bei jeder Unsicherheit blockieren.
~~~

## Geplanter Command-Request

Ein spaeterer Request darf nur minimale, eindeutig gebundene Daten enthalten:

~~~text
action
targetType
targetIds
traceId
alertId
soundJobId
bundleId
preflightId
confirmationCode
requestedBy
requestedRole
clientRequestId
~~~

Regel:

~~~text
clientRequestId dient spaeter zur Idempotenz.
confirmationCode darf nicht im Log im Klartext landen.
requestedBy und requestedRole muessen serverseitig verifiziert werden.
Ziel-IDs muessen zur Preflight-Pruefung passen.
~~~

## Geplante Command-Response

Eine spaetere Antwort soll klar zwischen blockiert, abgelehnt, ausgefuehrt und teilweise ausgefuehrt unterscheiden.

~~~text
ok
executed
blocked
action
state
result
message
auditId
blockReasons
warnings
rollbackHint
safetyStopActive
duplicateBlocked
clientRequestId
executedAt
~~~

## Guard-Reihenfolge fuer den Command

Der spaetere Command muss dieselbe Guard-Idee aus CAN-6.2 verwenden, aber strenger als Preflight.

Pflichtreihenfolge:

~~~text
1. AuthGuard
2. RoleGuard
3. ActionMatrixGuard
4. ConfirmationCodeGuard
5. PreflightBindingGuard
6. RecoveryStateGuard
7. SafetyStopGuard
8. StatusGuard
9. DuplicateGuard
10. RateLimitGuard
11. AuditStartGuard
12. ExecutionGuard
13. AuditResultGuard
14. RollbackHintGuard
~~~

Wenn ein Guard fehlschlaegt:

~~~text
sofort blockieren
keine produktive Aktion ausfuehren
Audit-Block schreiben, falls Audit-System verfuegbar ist
Response mit blockReasons liefern
Bestätigungs-Code nicht fuer erfolgreiche Ausfuehrung markieren
~~~

## Erlaubte Command-Kategorien nach CAN-6.1

CAN-6.6 haelt die bisherigen Grenzen ein.

### Nur Diagnose / kein Command

~~~text
missingAck
noClient
unmatched
waitingTooLong
soundFetchFailed
bundle_wait_timeout
overlay_watchdog_issue
~~~

Diese Zustaende duerfen spaeter weiter angezeigt und per Preflight bewertet werden. Ein direkter Ausfuehrungs-Command bleibt fuer diese Zustaende nicht automatisch erlaubt.

### Spaeter eventuell manuell erlaubte Low-Risk-Aktionen

Nur diese Aktionen duerfen spaeter ueberhaupt fuer einen Command geplant werden:

~~~text
refresh_overlay_state
clear_stale_visual_wait
mark_recovery_reviewed
request_status_recheck
manual_unlock_stale_bundle
~~~

Auch diese Aktionen brauchen:

~~~text
Owner/Admin
Bestätigungs-Code
Audit
Duplikat-Sperre
Safety-Stop-Pruefung
Rollback-/Clear-Hinweis
~~~

### Weiterhin hart blockiert

Diese Aktionen bleiben auch nach CAN-6.6 blockiert:

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
~~~

Kein Command darf diese Aktionen ausfuehren, solange nicht ein eigener spaeterer Sicherheitsblock mit harter Duplikat-Sperre, Live-Test und ausdruecklicher Freigabe existiert.

## Idempotenz und Duplikat-Sperre

Ein spaeterer Command muss mehrfaches Ausloesen verhindern.

Pflichtregeln:

~~~text
clientRequestId darf pro User/Aktion/Ziel nur einmal erfolgreich verarbeitet werden
preflightId darf nicht mehrfach fuer unterschiedliche Ziel-IDs verwendet werden
Bestätigungs-Code darf nur einmal verbraucht werden
traceId/alertId/soundJobId/bundleId muessen gegen parallele Aktionen gesperrt werden
laufende Alerts/Sounds/Bundles blockieren riskante Aktionen
Safety-Window verhindert schnelle Wiederholung
~~~

## Audit-Regel

Jeder Command-Versuch muss auditierbar sein.

Pflicht-Auditpunkte:

~~~text
command.requested
command.blocked
command.confirmation_failed
command.duplicate_blocked
command.started
command.finished
command.failed
command.rollback_hint_created
~~~

Pflichtfelder:

~~~text
auditId
timestamp
userId
userName
role
action
targetType
targetIds
traceId
alertId
soundJobId
bundleId
preflightId
clientRequestId
oldState
newState
result
blockReasons
error
~~~

Sensible Werte werden nicht im Klartext protokolliert.

## Rollback-/Clear-Regel

Ein spaeterer Command darf nur gebaut werden, wenn vorher klar ist, was bei Fehlern passiert.

Beispiele:

~~~text
refresh_overlay_state:
  Rollback: keiner, da nur Statusrefresh; Fehler bleibt Diagnose.

clear_stale_visual_wait:
  Rollback: alten Zustand nicht automatisch wiederherstellen; Audit und erneute Statuspruefung.

mark_recovery_reviewed:
  Rollback: reviewed-Markierung nur per separater Admin-Aktion zuruecksetzen.

request_status_recheck:
  Rollback: keiner; nur neue Diagnose anfordern.

manual_unlock_stale_bundle:
  Rollback: Bundle-Lock nicht automatisch neu setzen; nur wenn Zustand eindeutig stale war.
~~~

## Safety-Stop-Regel

Der globale Recovery-Safety-Stop blockiert jeden spaeteren Command.

~~~text
Safety-Stop aktiv -> Command blockiert
Modul-Stop aktiv -> Command blockiert
laufender Alert/Sound -> riskante Aktion blockiert
unklarer Status -> Command blockiert
fehlender Audit-Write -> Command blockiert
fehlende Duplikat-Sperre -> Command blockiert
~~~

## Dashboard-Regel

CAN-6.6 erlaubt weiterhin keine Buttons.

Spaeter duerfte das Dashboard einen Command nur anbieten, wenn ein eigener Code-Step freigegeben wurde.

Bis dahin gilt:

~~~text
Dashboard zeigt Preflight read-only.
Dashboard zeigt keine Execute-Buttons.
Dashboard erzeugt keinen Bestätigungs-Code.
Dashboard verbraucht keinen Bestätigungs-Code.
Dashboard sendet keine produktiven Commands.
~~~

## Testregeln fuer einen spaeteren Code-Step

Vor jeder spaeteren Umsetzung muessen Tests geplant werden:

~~~text
Preflight ok, Command blockiert wegen fehlendem Bestätigungs-Code
Preflight ok, Command blockiert wegen falscher Rolle
Preflight ok, Command blockiert wegen Safety-Stop
Preflight ok, Command blockiert wegen Duplikat
Preflight ok, Command blockiert wegen veraenderter Ziel-ID
Preflight ok, Command schreibt Audit-Block
Low-Risk-Command kann nur mit gueltiger Guard-Kette ausfuehren
hart blockierte Aktionen bleiben blockiert
Replay/Retry/Auto-Recovery bleiben blockiert
~~~

## Nicht geändert

CAN-6.6 ist nur Planung.

~~~text
Keine Backend-Änderung
Keine API-Änderung
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

## Nächster sinnvoller Schritt

~~~text
CAN-6.7: Recovery-Command-Audit-/State-Mapping planen
~~~

Ziel von CAN-6.7:

~~~text
Command-Zustaende
Audit-Uebergaenge
State-Felder
Blockierungsgruende
Dashboard-Anzeige nach Command-Versuch
Rollback-/Clear-Anzeige
weiterhin ohne Code
~~~
