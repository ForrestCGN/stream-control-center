# EVENTBUS CAN-15.2 - Audit Boundary no-write Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-15.2

## Zweck

CAN-15.2 plant die Audit-Boundary fuer spaetere Recovery-/Safety-nahe Aktionen.

Wichtig:

```text
Dies ist nur Planung/Dokumentation.
Keine Code-Aenderung.
Keine API.
Keine Route.
Keine DB-Migration.
Keine Speicherung.
Keine Dashboard-Aenderung.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
```

## Ausgangslage

CAN-15.1 hat als naechsten sicheren Kandidaten entschieden:

```text
CAN-15.2 - Audit Boundary no-write Planning
```

Die Grenze fuer CAN-15.2 ist:

```text
Audit planen, aber nicht speichern.
Audit-Struktur definieren, aber keine Write-Phase.
Audit-Felder klaeren, aber keine DB.
```

## Harte no-write-Grenze

CAN-15.2 darf nicht enthalten:

```text
CREATE TABLE
INSERT
UPDATE
DELETE
POST /audit
PUT /audit
PATCH /audit
API-Route
Dashboard-Button
Recovery-Ausfuehrung
SafetyStop Clear
Confirm Trigger
Rechte-Mutation
```

## Audit-Ziel fuer spaeter

Ein spaeteres Audit-System soll nachvollziehbar machen:

```text
wer eine sicherheitsnahe Aktion angefragt hat
welche Aktion angefragt wurde
welcher Scope betroffen war
welche Entscheidung getroffen wurde
warum etwas erlaubt, blockiert, abgebrochen oder fehlgeschlagen ist
welche Guards/Preflights beteiligt waren
ob Confirm/Rechte/SafetyStop relevant waren
welches Ergebnis entstanden ist
```

## Audit-Phasen fuer spaeter

### 1. Request

Spaeteres Ereignis:

```text
audit.request
```

Zweck:

```text
Eine sicherheitsnahe Anfrage wurde gestellt.
```

Beispiele:

```text
Recovery-Preflight anzeigen
SafetyStop Status pruefen
spaeter moeglich: Recovery vorbereiten
spaeter moeglich: SafetyStop setzen
```

### 2. Decision

Spaeteres Ereignis:

```text
audit.decision
```

Zweck:

```text
Das System entscheidet, ob eine Anfrage erlaubt, blockiert, abgebrochen oder weiter geprueft wird.
```

Moegliche Entscheidungen:

```text
allowed_read_only
blocked_hard_rule
blocked_missing_rights
blocked_safety_stop
blocked_confirm_missing
blocked_guard_failed
cancelled_by_operator
cancelled_by_system
failed_preflight
```

### 3. Result

Spaeteres Ereignis:

```text
audit.result
```

Zweck:

```text
Ergebnis nach Abschluss der Aktion.
```

Moegliche Ergebnisse:

```text
displayed
refreshed_read_only
blocked
cancelled
failed
executed_later_phase_only
```

Wichtig:

```text
executed_later_phase_only ist nur ein Planungsbegriff.
CAN-15.2 fuehrt nichts aus.
```

## Pflichtfelder fuer spaeter

Eine spaetere Audit-Struktur sollte mindestens diese Felder haben:

```text
auditId
eventType
eventPhase
createdAt
actorType
actorId
actorDisplayName
source
action
scope
targetType
targetId
decision
result
reason
riskLevel
readOnly
canPrepare
canExecute
recoveryExecution
routeMethod
routePath
correlationId
requestId
guardSummary
preflightSummary
safetyStopState
confirmState
rightsState
metadata
```

## Feldbedeutung

### auditId

```text
Eindeutige ID des Audit-Eintrags.
```

### eventType

```text
Technische Ereignisart, z. B. recovery.safety.view oder recovery.preflight.refresh.
```

### eventPhase

```text
request, decision oder result.
```

### actorType

```text
dashboard_user
system
streamerbot
unknown
```

### source

```text
dashboard
backend
eventbus
system
```

### action

```text
Die konkrete geplante oder angefragte Aktion.
```

### scope

```text
Der betroffene Sicherheitsbereich, z. B. recovery, safety_status, preflight, guards.
```

### decision

```text
allowed_read_only
blocked_hard_rule
cancelled
failed
```

### riskLevel

```text
low
medium
high
critical
```

### readOnly

```text
true/false - muss fuer aktuelle CAN-Struktur true bleiben.
```

### canPrepare / canExecute / recoveryExecution

```text
Sicherheitswerte, die zeigen, ob Recovery-nahe Ausfuehrung moeglich war.
```

Aktuell muessen sie bleiben:

```text
canPrepare: false
canExecute: false
recoveryExecution: false
```

## Daten, die niemals gespeichert werden duerfen

Spaeteres Audit darf niemals Klartext speichern fuer:

```text
Tokens
Secrets
OAuth Tokens
Refresh Tokens
API Keys
Session Cookies
Passwoerter
private Headers
vollstaendige personenbezogene Rohdaten ohne Zweck
vollstaendige Chatlogs ohne Notwendigkeit
vollstaendige Request Bodies mit Secrets
```

## Datenschutz-/Minimierungsregel

Audit soll spaeter nur speichern:

```text
so viel wie fuer Nachvollziehbarkeit noetig
so wenig wie moeglich
keine Secrets
keine sensiblen Rohdaten
```

## Maskierungsregel fuer spaeter

Falls ein Wert potentiell sensibel ist:

```text
maskieren
hashen
weglassen
```

Beispiele:

```text
token_abc123 -> [redacted]
user@email.tld -> optional hash/gekürzt je nach Zweck
Authorization Header -> [redacted]
```

## Aktuelle read-only Audit-Kandidaten

Diese Ereignisse koennten spaeter auditierbar sein, bleiben aber in CAN-15.2 nur geplant:

```text
safety_status_view_opened
recovery_preflight_loaded
manual_diagnostics_refresh_requested
manual_status_resync_requested
recovery_guards_viewed
hard_blockers_viewed
```

## Spaetere high-risk Audit-Kandidaten

Diese bleiben hart blockiert und duerfen nicht umgesetzt werden:

```text
alert_replay_requested
sound_replay_requested
queue_clear_requested
overlay_repair_requested
execute_recovery_requested
safety_stop_clear_requested
```

## Audit-Level

Empfohlene spaetere Level:

```text
info
notice
warning
blocked
error
critical
```

## Audit-Risk-Mapping

```text
read-only view -> low
read-only refresh -> low
status resync read-only -> low
safetyStop set -> medium/high
safetyStop clear -> high/critical
queue clear -> critical
alert replay -> critical
sound replay -> critical
execute recovery -> critical
```

## No-write Validierung fuer spaeter

Wenn spaeter eine technische Audit-Planung folgt, muss zuerst geprueft werden:

```text
kein DB-Zugriff
keine Schreibroute
keine Datei schreiben
keine Config schreiben
keine EventBus-Mutation
kein Recovery-Trigger
```

## Keine technische Umsetzung in CAN-15.2

CAN-15.2 erstellt nicht:

```text
audit_helper.js
audit.js
audit table
audit route
dashboard audit page
audit button
eventbus audit event
```

## Spaetere Phasen nur als Orientierung

Moegliche spaetere Reihenfolge, noch nicht freigegeben:

```text
CAN-15.3 Audit Event Catalog no-write
CAN-15.4 Audit Data Minimization Policy
CAN-15.5 Audit Display Planning read-only
CAN-16.x erst spaeter: technische Audit-Read-only Anzeige
```

Nicht freigegeben:

```text
Audit Write Phase
```

## Harte Regeln bleiben

Weiterhin verboten:

```text
Keine POST-/Command-/Prepare-/Execute-Route
Keine Recovery-Ausfuehrung
Keine Queue-Mutation
Keine Sound-Mutation
Keine Alert-Mutation
Keine Overlay-Mutation
Keine DB-/Config-Schreibzugriffe
Keine Streamer.bot-/OBS-Aktion
Keine Auto-Recovery
Kein Alert Replay
Kein Sound Replay
Kein Queue Clear
Kein Overlay State Repair
Keine Audit Write Route
```

## Ergebnis CAN-15.2

CAN-15.2 definiert:

```text
Audit-Boundary ist no-write geplant.
Audit-Phasen Request/Decision/Result sind definiert.
Pflichtfelder sind geplant.
Secrets-/Datenschutzgrenzen sind festgelegt.
Spaetere Write-Phase bleibt hart blockiert.
```

## Naechster sinnvoller Schritt

```text
CAN-15.3 - Audit Event Catalog no-write Planning
```
