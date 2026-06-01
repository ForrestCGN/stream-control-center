# EVENTBUS CAN-15.3 - Audit Event Catalog no-write Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-15.3

## Zweck

CAN-15.3 plant einen Audit-Event-Katalog fuer spaetere Recovery-/Safety-nahe Nachvollziehbarkeit.

Wichtig:

```text
Dies ist nur Planung/Dokumentation.
Keine Code-Aenderung.
Keine API.
Keine Route.
Kein EventBus-Emit.
Keine DB-Migration.
Keine Speicherung.
Keine Dashboard-Aenderung.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
```

## Ausgangslage

CAN-15.2 hat die Audit-Boundary no-write geplant.

Definiert wurden dort:

```text
Audit-Phasen Request / Decision / Result
Pflichtfelder fuer spaeter
Daten, die niemals gespeichert werden duerfen
Datenschutz-/Minimierungsregel
Maskierungsregel
No-write-Grenze
```

CAN-15.3 katalogisiert nun moegliche Audit-Events, ohne sie technisch umzusetzen.

## Harte no-write-Grenze

CAN-15.3 darf nicht enthalten:

```text
CREATE TABLE
INSERT
UPDATE
DELETE
POST /audit
API-Route
Dashboard-Button
EventBus-Emit
Recovery-Ausfuehrung
SafetyStop Clear
Confirm Trigger
Rechte-Mutation
```

## Event-Namensschema

Empfohlenes Schema fuer spaetere Audit-Events:

```text
audit.<domain>.<subject>.<action>.<phase>
```

Beispiele:

```text
audit.recovery.preflight.load.request
audit.recovery.preflight.load.decision
audit.recovery.preflight.load.result
```

## Domains

Empfohlene Domains:

```text
recovery
safety
guards
dashboard
audit
rights
confirm
safetystop
system
```

## Phasen

Aus CAN-15.2:

```text
request
decision
result
```

## Event-Kategorien

```text
read_only_view
read_only_refresh
read_only_resync
blocked_high_risk
cancelled
failed
future_write_blocked
```

## Risiko-Stufen

```text
low
medium
high
critical
```

## Event-Katalog: Read-only Events

Diese Events koennen spaeter auditierbar sein, bleiben aber in CAN-15.3 nur geplant.

| Event | Kategorie | Risiko | Phase(n) | Beschreibung |
|---|---|---|---|---|
| audit.dashboard.safety_status.view.request | read_only_view | low | request | Safety Status View wurde angefragt/geoeffnet |
| audit.dashboard.safety_status.view.decision | read_only_view | low | decision | Anzeige ist erlaubt, weil read-only |
| audit.dashboard.safety_status.view.result | read_only_view | low | result | Safety Status View wurde angezeigt |
| audit.recovery.preflight.load.request | read_only_refresh | low | request | Recovery-Preflight GET wurde angefragt |
| audit.recovery.preflight.load.decision | read_only_refresh | low | decision | Preflight Load erlaubt, weil GET/read-only |
| audit.recovery.preflight.load.result | read_only_refresh | low | result | Preflight-Daten wurden angezeigt |
| audit.recovery.diagnostics_refresh.request | read_only_refresh | low | request | Manueller Diagnose-Refresh wurde angefragt |
| audit.recovery.diagnostics_refresh.decision | read_only_refresh | low | decision | Refresh erlaubt, weil nur GET/read-only |
| audit.recovery.diagnostics_refresh.result | read_only_refresh | low | result | Diagnose-Refresh wurde abgeschlossen |
| audit.recovery.status_resync.request | read_only_resync | low | request | Status-Resync wurde angefragt |
| audit.recovery.status_resync.decision | read_only_resync | low | decision | Resync erlaubt, weil nur vorhandene Diagnosequellen bewertet werden |
| audit.recovery.status_resync.result | read_only_resync | low | result | Status-Resync wurde angezeigt |
| audit.guards.recovery.view.request | read_only_view | low | request | Recovery Guards Anzeige wurde geoeffnet |
| audit.guards.recovery.view.decision | read_only_view | low | decision | Guards View erlaubt, weil read-only |
| audit.guards.recovery.view.result | read_only_view | low | result | Guards wurden angezeigt |
| audit.safety.hard_blockers.view.request | read_only_view | low | request | Hard-Blocker-Liste wurde angezeigt/geoeffnet |
| audit.safety.hard_blockers.view.decision | read_only_view | low | decision | Anzeige erlaubt, weil read-only |
| audit.safety.hard_blockers.view.result | read_only_view | low | result | Hard-Blocker wurden angezeigt |

## Event-Katalog: Blocked High-Risk Events

Diese Events bleiben hart blockiert und duerfen nicht technisch ausloesbar gemacht werden.

| Event | Kategorie | Risiko | Erwartete Entscheidung | Beschreibung |
|---|---|---|---|---|
| audit.recovery.alert_replay.request | blocked_high_risk | critical | blocked_hard_rule | Alert Replay wurde angefragt, bleibt blockiert |
| audit.recovery.sound_replay.request | blocked_high_risk | critical | blocked_hard_rule | Sound Replay wurde angefragt, bleibt blockiert |
| audit.recovery.queue_clear.request | blocked_high_risk | critical | blocked_hard_rule | Queue Clear wurde angefragt, bleibt blockiert |
| audit.recovery.overlay_repair.request | blocked_high_risk | high | blocked_hard_rule | Overlay Repair wurde angefragt, bleibt blockiert |
| audit.recovery.execute.request | blocked_high_risk | critical | blocked_hard_rule | Execute Recovery wurde angefragt, bleibt blockiert |
| audit.recovery.auto_recovery.request | blocked_high_risk | critical | blocked_hard_rule | Auto Recovery bleibt blockiert |
| audit.recovery.auto_retry_overlay.request | blocked_high_risk | critical | blocked_hard_rule | Auto Retry Overlay bleibt blockiert |
| audit.system.streamerbot_action_retry.request | blocked_high_risk | critical | blocked_hard_rule | Streamer.bot Action Retry bleibt blockiert |
| audit.system.obs_source_refresh.request | blocked_high_risk | high | blocked_hard_rule | OBS Source Refresh bleibt blockiert |
| audit.safetystop.clear.request | blocked_high_risk | critical | blocked_hard_rule | SafetyStop Clear bleibt blockiert |
| audit.audit.write_route.request | future_write_blocked | critical | blocked_hard_rule | Audit Write Route bleibt blockiert |
| audit.confirm.api.request | future_write_blocked | high | blocked_hard_rule | Confirm API bleibt blockiert |
| audit.rights.mutation.request | future_write_blocked | high | blocked_hard_rule | Rollen-/Rechte-Mutation bleibt blockiert |

## Event-Katalog: Cancel Events fuer spaeter

Nur Planung, keine Umsetzung.

| Event | Kategorie | Risiko | Beschreibung |
|---|---|---|---|
| audit.recovery.action.cancel.operator | cancelled | medium | Operator bricht eine spaetere vorbereitete Aktion ab |
| audit.recovery.action.cancel.system | cancelled | medium | System bricht wegen Guard/Preflight/SafetyStop ab |
| audit.recovery.action.cancel.timeout | cancelled | medium | Confirm/Request laeuft spaeter ab |
| audit.recovery.action.cancel.rights | cancelled | medium | Rechte reichen nicht aus |
| audit.recovery.action.cancel.safetystop | cancelled | high | SafetyStop blockiert spaeter eine Aktion |

## Event-Katalog: Failed Events fuer spaeter

Nur Planung, keine Umsetzung.

| Event | Kategorie | Risiko | Beschreibung |
|---|---|---|---|
| audit.recovery.preflight.failed | failed | medium | Preflight konnte nicht sauber gelesen/bewertet werden |
| audit.guards.recovery.failed | failed | medium | Guard-Auswertung fehlgeschlagen |
| audit.dashboard.safety_status.failed | failed | low | Safety Status View konnte nicht angezeigt werden |
| audit.system.audit_boundary.failed | failed | high | Spaeteres Audit selbst konnte nicht sauber arbeiten |

## Pflichtfelder je Event spaeter

Jedes spaetere Event sollte mindestens enthalten:

```text
auditId
event
eventPhase
category
riskLevel
createdAt
actorType
actorId
source
action
scope
decision
result
reason
readOnly
canPrepare
canExecute
recoveryExecution
routeMethod
routePath
correlationId
requestId
metadata
```

## No-Secret-Regel je Event

Jedes Event muss spaeter frei sein von:

```text
Tokens
Secrets
API Keys
Passwoertern
Session Cookies
Authorization Headern
vollstaendigen Request Bodies mit sensiblen Daten
```

## Erlaubte Metadaten fuer spaeter

Spaeter moeglich:

```text
module name
module version
route path ohne Secret-Query
HTTP method
read-only flags
guard counts
preflight counts
decision reason code
risk level
scope
```

## Nicht erlaubte Metadaten fuer spaeter

Nicht speichern:

```text
full headers
full cookies
raw tokens
full request body
private user data ohne Zweck
komplette Chatlogs
Secrets in Query-Strings
```

## Stabilitaetsregel fuer Event-Namen

Event-Namen sollen spaeter stabil bleiben.

Aenderungen an Event-Namen muessen dann dokumentiert werden, weil sonst Dashboards, Filter oder Auswertungen brechen koennen.

## Aktuelle Nicht-Umsetzung

CAN-15.3 erstellt nicht:

```text
audit emitter
audit helper
audit route
audit database
audit dashboard
eventbus event
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

## Ergebnis CAN-15.3

CAN-15.3 definiert:

```text
Audit-Event-Namensschema
Read-only Event-Katalog
Blocked High-Risk Event-Katalog
Cancel-/Failed-Event-Planung
Pflichtfelder je Event
No-Secret-Regeln
Metadaten-Grenzen
```

## Naechster sinnvoller Schritt

```text
CAN-15.4 - Audit Data Minimization Policy no-write Planning
```
