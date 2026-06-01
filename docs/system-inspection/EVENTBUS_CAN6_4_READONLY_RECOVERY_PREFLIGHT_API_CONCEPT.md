# EVENTBUS CAN-6.4 READ-ONLY RECOVERY-PREFLIGHT-API-KONZEPT

Stand: 2026-06-01
Status: Plan / Sicherheitskonzept / keine Umsetzung
Marker: STEP_CAN6_4_READONLY_RECOVERY_PREFLIGHT_API_CONCEPT

## Ausgangslage

CAN-6.1 hat die manuelle Recovery-Aktionsmatrix definiert.
CAN-6.2 hat den Backend-Schutzvertrag geplant.
CAN-6.3 hat Audit- und Bestätigungs-Code-Konzept beschrieben.

CAN-6.4 plant jetzt nur, wie eine spätere read-only Preflight-API aussehen darf.

Wichtig: CAN-6.4 aktiviert keine Route und baut keinen produktiven Code.

~~~text
Keine Backend-Änderung
Keine API-Route aktivieren
Keine Dashboard-Code-Änderung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

## Ziel von CAN-6.4

Eine spätere Preflight-API soll vor jeder manuellen Recovery-Aktion nur prüfen und anzeigen, ob eine Aktion grundsätzlich erlaubt wäre.

Sie darf keine produktive Wirkung haben.

~~~text
Preflight liest Diagnose- und Statusdaten.
Preflight prüft Guards nur trocken/read-only.
Preflight liefert Gründe, Risiken und Blockaden.
Preflight kann später einen Bestätigungs-Code vorbereiten, aber nur wenn alle Schutzregeln erfüllt sind.
Preflight startet keine Recovery.
Preflight wiederholt keine Alerts.
Preflight wiederholt keine Sounds.
Preflight triggert keine Overlays.
Preflight verändert keine Queues oder Locks.
~~~

## Harte Grenze

Eine spätere Preflight-Route darf niemals:

~~~text
Alert erneut auslösen
Sound erneut starten
Overlay erneut triggern
Queue verschieben
Bundle-Lock setzen oder lösen
aktive Jobs stoppen
Datenbank blind migrieren
Config verändern
Safety-Stop deaktivieren
Recovery ausführen
~~~

## Geplante spätere Route

Nur als Konzept, nicht umgesetzt:

~~~text
POST /api/bus-diagnostics/recovery/preflight
~~~

Warum POST statt GET:

~~~text
Die Anfrage enthält später Aktion, Ziel-IDs und Kontext.
Sie bleibt trotzdem read-only.
POST verhindert, dass lange/empfindliche IDs in URLs landen.
POST bedeutet hier nicht automatisch Schreiboperation.
~~~

Die Route darf erst in einem separaten Code-Step gebaut werden.

## Request-Konzept

Eine spätere Preflight-Anfrage braucht mindestens:

~~~text
action
recoveryState
traceId oder alertId oder eventId
sourceModule
requestedBy
requestedRole
reason optional
clientContext optional
~~~

Beispiel nur als Datenvertrag:

~~~json
{
  "action": "request_status_recheck",
  "recoveryState": "missingAck",
  "traceId": "...",
  "sourceModule": "bus_diagnostics",
  "requestedBy": "dashboard-user",
  "requestedRole": "owner"
}
~~~

## Response-Konzept

Eine spätere Preflight-Antwort soll feldgenau und dashboardfähig sein:

~~~text
ok
mode
action
allowed
blocked
severity
requiresConfirmation
confirmationAvailable
confirmationCodeId
confirmationExpiresAt
reasons
blockedReasons
warnings
requiredRole
actualRole
auditPreview
rollbackPreview
duplicateCheck
safetyStop
stateSnapshot
readOnlyGuarantee
productiveEffects
nextAllowedStep
~~~

Pflichtregel:

~~~text
productiveEffects muss immer leer oder ausdrücklich false sein.
readOnlyGuarantee muss true sein.
~~~

## Guard-Prüfungen im Preflight

Alle Guards laufen nur prüfend. Sie dürfen keine Zustände verändern.

| Guard | Preflight-Verhalten | Darf schreiben? | Ergebnis |
|---|---|---:|---|
| AuthGuard | User/Rolle prüfen | Nein | erlaubt/blockiert |
| ActionMatrixGuard | Aktion gegen CAN-6.1-Matrix prüfen | Nein | erlaubt/blockiert |
| RecoveryStateGuard | Diagnosezustand prüfen | Nein | passend/unpassend |
| SafetyStopGuard | globale und modulbezogene Stops prüfen | Nein | offen/blockiert |
| StatusGuard | Alert/Sound/Overlay/Queue/Lock-Status lesen | Nein | sicher/unsicher |
| DuplicateGuard | traceId/alertId/eventId/bundleId/soundJobId prüfen | Nein | frei/blockiert |
| RateLimitGuard | spätere Wiederholung/Prüffrequenz bewerten | Nein | frei/blockiert |
| AuditGuard | Audit-Fähigkeit prüfen | Nein | auditfähig/blockiert |
| RollbackGuard | Rollback-/Clear-Regel prüfen | Nein | vorhanden/fehlt |
| ConfirmationGuard | Bestätigungs-Code-Fähigkeit prüfen | Nein im reinen Check | verfügbar/nicht verfügbar |

## Wann Preflight blockiert

Preflight muss blockieren, wenn:

~~~text
Rolle nicht Owner/Admin ist
Aktion nicht in der CAN-6.1-Matrix erlaubt ist
Aktion zu Replay/Retry/Auto-Recovery führen würde
Safety-Stop aktiv ist
laufender Alert/Sound/Overlay-Job betroffen ist
Bundle-Lock aktiv oder unklar ist
Duplikat-Sperre anschlägt
Audit-System nicht verfügbar ist
Rollback-/Clear-Regel fehlt
Statusdaten fehlen oder widersprüchlich sind
~~~

Blockiert bedeutet:

~~~text
allowed=false
blocked=true
confirmationAvailable=false
nextAllowedStep=none oder review_only
~~~

## Wann Preflight nur Warnungen liefert

Warnungen sind erlaubt, wenn sie keine produktive Gefahr bedeuten:

~~~text
Diagnosedaten sind alt, aber noch lesbar
Dashboard-Client-Kontext fehlt
optionale Beschreibung fehlt
Recovery-State ist niedrig priorisiert
Aktion ist nur review/mark und verändert keine produktiven Jobs
~~~

Warnungen dürfen nicht zur Freigabe führen, wenn gleichzeitig harte Blockaden existieren.

## Bestätigungs-Code im Preflight

CAN-6.4 legt nur das Konzept fest.

Eine spätere Preflight-API darf einen Bestätigungs-Code nur vorbereiten oder ausstellen, wenn:

~~~text
alle Guards erlaubt melden
Audit-Vorschau möglich ist
Rollback-Regel existiert
Duplikat-Sperren frei sind
Safety-Stop nicht aktiv ist
Aktion keine Replay-/Retry-/Auto-Recovery-Aktion ist
User/Rolle eindeutig Owner/Admin ist
~~~

Bei jeder Blockade gilt:

~~~text
Kein Bestätigungs-Code.
Nur Anzeige der Gründe.
~~~

## Read-only-Garantie

Die spätere Implementierung muss technisch nachweisen:

~~~text
keine Queue-Mutationen
keine Lock-Mutationen
keine OBS-/Overlay-Kommandos
keine Sound-System-Kommandos
keine Alert-System-Kommandos
keine EventBus-Produktiv-Events
keine DB-Schreiboperation ausser ggf. separater Audit-/Preflight-Log in einem später geplanten Step
~~~

Für CAN-6.4 gilt: selbst diese Audit-/Preflight-Log-Schreibfrage bleibt nur geplant.

## Dashboard-Anzeige später

Falls später ein Dashboard-Preflight gebaut wird, darf er zunächst nur anzeigen:

~~~text
Aktion
Status
Blockiert/erlaubt
Gründe
Warnungen
benötigte Rolle
erkannte Rolle
betroffene IDs
Safety-Stop-Status
Duplikat-Prüfung
Rollback-Hinweis
Read-only-Hinweis
~~~

Kein Button für echte Recovery in CAN-6.4.

## Aktionen aus CAN-6.1: Preflight-Einstufung

| Aktion | Preflight möglich? | Bestätigungs-Code möglich? | Produktive Ausführung? |
|---|---:|---:|---:|
| mark_recovery_reviewed | später ja | später eventuell | nein in CAN-6.4 |
| request_status_recheck | später ja | später eventuell | nein in CAN-6.4 |
| refresh_overlay_state | später ja | nur nach separatem Schutzstep | nein in CAN-6.4 |
| clear_stale_visual_wait | später ja | nur nach separatem Schutzstep | nein in CAN-6.4 |
| manual_unlock_stale_bundle | später ja | nur nach separatem Schutzstep | nein in CAN-6.4 |
| manual_replay_alert | nein | nein | hart blockiert |
| manual_replay_sound | nein | nein | hart blockiert |
| auto_replay_alert | nein | nein | hart blockiert |
| auto_replay_sound | nein | nein | hart blockiert |
| auto_retry_overlay | nein | nein | hart blockiert |
| auto_recovery | nein | nein | hart blockiert |

## Offene Punkte für späteren Code-Step

Vor jeder Umsetzung müssen echte Dateien geprüft werden:

~~~text
backend/modules/bus_diagnostics.js
backend/modules/communication_bus.js
backend/modules/alert_system.js
backend/modules/sound_system.js
htdocs/dashboard/modules/bus_diagnostics.js
config/alert_system.json
config/sound_system.json
~~~

Zusätzlich muss vor jeder DB-Frage die echte produktive DB-Situation geprüft werden.

## Nicht geändert

~~~text
Keine Backend-Dateien geändert
Keine API-Routen ergänzt
Keine Dashboard-Dateien geändert
Keine Overlay-Dateien geändert
Keine Config-Dateien geändert
Keine Datenbank geändert
Keine produktiven Flows geändert
Keine Recovery-Buttons ergänzt
Keine Simulation-Buttons ergänzt
Keine automatische Recovery aktiviert
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-6.5: Dashboard-Preflight-Anzeige und UX-Regeln planen
~~~

CAN-6.5 soll weiterhin keine produktive Recovery aktivieren, sondern nur festlegen, wie die späteren Preflight-Daten im Dashboard sicher und eindeutig angezeigt werden dürfen.
