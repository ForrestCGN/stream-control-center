# EVENTBUS CAN-8.1 RECOVERY PREFLIGHT READ-ONLY DATENMODELL

Stand: 2026-06-01
Status: Planung / Datenmodell / keine technische Umsetzung

## Ausgangslage

CAN-8.0 hat die Startgrenze fuer den Preflight-Strang definiert.

Bestaetigter Stand aus CAN-7.x und CAN-8.0:

~~~text
Recovery-Readiness ist backendseitig read-only vorhanden.
Recovery-Readiness ist im Dashboard read-only sichtbar.
Recovery-Tab ist mit internen Untertabs aufgeraeumt.
Keine Recovery-Buttons.
Keine Simulation-Buttons.
Keine Command-Route.
Keine Recovery-Ausfuehrung.
Keine produktive Flow-Aenderung.
~~~

## Ziel von CAN-8.1

CAN-8.1 definiert nur das spaetere read-only Datenmodell fuer einen Recovery-Preflight.

Preflight bedeutet hier:

~~~text
Eine geplante Diagnose fragt: Wuerde eine spaetere Low-Risk-Aktion theoretisch vorbereitet werden duerfen?
Sie fuehrt keine Aktion aus.
Sie schreibt nichts produktiv.
Sie entsperrt keine Queue.
Sie wiederholt keinen Alert.
Sie startet keinen Sound.
Sie steuert kein Overlay.
~~~

## Nicht-Ziel

CAN-8.1 ist kein Code-Step.

Nicht erlaubt:

~~~text
Backend-Datei aendern
Dashboard-Datei aendern
neue API-Route bauen
POST-/Command-Route bauen
Recovery-Button bauen
Simulation-Button bauen
Recovery ausfuehren
Queue-/Sound-/Alert-/Overlay-State veraendern
DB-/Config-Migration
~~~

## Geplantes Datenmodell

Spaeteres read-only Feld im Bus-Diagnostics-Kontext:

~~~text
recoveryPreflight
~~~

Geplante Struktur:

~~~json
{
  "ok": true,
  "status": "ready|blocked|observe|unavailable",
  "mode": "read_only",
  "readOnly": true,
  "currentStep": "CAN-8.x",
  "requestedAction": "request_status_recheck|mark_recovery_reviewed|refresh_overlay_state|clear_stale_visual_wait|manual_unlock_stale_bundle",
  "actionClass": "diagnostic_only|low_risk_clear|blocked_high_risk",
  "canPrepare": false,
  "canExecute": false,
  "requiresExplicitGo": true,
  "requiresOwnerAdmin": true,
  "requiresConfirmation": true,
  "requiresAudit": true,
  "requiresDuplicateGuard": true,
  "requiresSafetyStop": true,
  "requiredGuards": [],
  "passedGuards": [],
  "missingGuards": [],
  "blockedActions": [],
  "hardBlockedActions": [],
  "blockers": [],
  "warnings": [],
  "reasons": [],
  "source": {},
  "checkedAt": "ISO-8601"
}
~~~

Wichtig: `canExecute` bleibt fuer CAN-8.x standardmaessig `false`, bis ein separater spaeterer Sicherheitsstep ausdruecklich freigegeben ist.

## Geplante Aktionseinstufung

### Diagnose-only

Diese Aktionen duerfen spaeter nur angezeigt oder geprueft werden:

~~~text
request_status_recheck
mark_recovery_reviewed
manual_trace_review
manual_overlay_review
manual_warning_review
~~~

### Potenziell Low-Risk, aber weiterhin nicht ausfuehren

Diese Aktionen duerfen spaeter nur nach eigener Planung und separatem Go vorbereitet werden:

~~~text
refresh_overlay_state
clear_stale_visual_wait
manual_unlock_stale_bundle
~~~

Voraussetzungen:

~~~text
Owner/Admin
Bestaetigungsdialog
Audit-Log
Duplikat-Sperre
Safety-Stop
aktueller Statuscheck
keine laufende Queue-/Sound-/Alert-Aktion
keine produktive Wiederholung
~~~

### Hart blockiert

Weiterhin hart blockiert:

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
manual_recovery_execution
~~~

## Guard-Felder

Geplante Guard-Liste:

~~~text
AuthGuard
ActionMatrixGuard
ReadOnlyModeGuard
RecoveryStateGuard
SafetyStopGuard
StatusGuard
DuplicateGuard
RateLimitGuard
AuditGuard
RollbackGuard
~~~

CAN-8.1 definiert nur die Namen und erwartete Auswertung. Es wird noch kein Guard technisch aktiviert.

## Read-only Sicherheitsfelder

Spaetere Preflight-Ausgabe muss mindestens enthalten:

~~~text
readOnly = true
automationEnabled = false
productiveActions = false
flowTouched = false
queueTouched = false
soundSystemTouched = false
alertSystemTouched = false
overlayTouched = false
canExecute = false
~~~

## Dashboard-Grenze

Das Dashboard darf spaeter nur anzeigen:

~~~text
Preflight-Status
angefragte Aktion
Einstufung
fehlende Guards
Blocker
Warnungen
hart blockierte Aktionen
naechster erlaubter Step
~~~

Nicht erlaubt:

~~~text
Ausfuehren-Button
Bestaetigen-Button
Replay-Button
Retry-Button
Unlock-Button
Auto-Recovery-Schalter
~~~

## CAN-8.2 Startgrenze

Naechster sinnvoller Schritt:

~~~text
CAN-8.2: Echte Dateien pruefen und konkrete read-only Preflight-Statusfelder fuer bus_diagnostics planen.
~~~

CAN-8.2 darf noch keinen produktiven Code aktivieren. Falls Code geplant wird, zuerst echte aktuelle Dateien pruefen und explizites Go einholen.
