# EVENTBUS CAN-19.0 - Recovery Safety Architecture Consolidation

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-19.0

## Zweck

CAN-19.0 konsolidiert die bisher einzeln geplanten Sicherheitsbausteine zu einer gemeinsamen Recovery-/Safety-Architektur.

Wichtig:

```text
Dies ist nur Dokumentation/Konsolidierung.
Keine Code-Aenderung.
Keine API.
Keine Route.
Keine Middleware.
Kein EventBus-Emit.
Keine DB-Migration.
Keine Speicherung.
Keine Dashboard-Aenderung.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
```

## Ausgangslage

Die folgenden Planungsstraenge sind abgeschlossen:

```text
CAN-15 - Audit Planning no-write / no-data
CAN-16 - SafetyStop Planning read-only / no-api
CAN-17 - Roles/Rights Planning no-mutation / no-implementation
CAN-18 - Confirm Planning no-action / no-implementation
```

CAN-19.0 fasst diese vier Bausteine zusammen.

## Architektur-Bausteine

### 1. Audit

Status:

```text
auditPlanning: true
auditBoundaryNoWrite: true
auditEventCatalog: true
auditDataMinimizationPolicy: true
auditDisplayPlanning: true
auditWrite: false
auditApi: false
auditReadApi: false
auditDb: false
auditDashboard: false
eventBusEmit: false
mockData: false
```

Rolle in der Sicherheitsarchitektur:

```text
Nachvollziehbarkeit von Requests, Decisions und Results.
```

Grenze:

```text
Keine Speicherung.
Keine Audit-API.
Keine Audit-DB.
Keine Audit-Events.
```

### 2. SafetyStop

Status:

```text
safetyStopPlanning: true
safetyStopStateMatrix: true
safetyStopDisplayContract: true
safetyStopIntegrationBoundary: true
safetyStopApi: false
safetyStopDb: false
safetyStopDashboard: false
safetyStopSet: false
safetyStopClear: false
safetyStopReset: false
eventBusEmit: false
```

Rolle in der Sicherheitsarchitektur:

```text
Zentraler Blockierstatus fuer riskante Aktionen.
```

Grenze:

```text
Keine API.
Kein Clear.
Kein Set.
Kein Reset.
Keine Dashboard-Aktion.
```

### 3. Roles/Rights

Status:

```text
rolesRightsPlanning: true
rolesRightsActionMatrix: true
rolesRightsBackendBoundary: true
rolesRightsDisplayBoundary: true
rolesApi: false
rightsApi: false
authSystem: false
userSystem: false
rolesDb: false
dashboardRightsEnforcement: false
rightsMiddleware: false
rightsMutation: false
eventBusEmit: false
```

Rolle in der Sicherheitsarchitektur:

```text
Serverseitige Entscheidung, wer was spaeter sehen oder anfragen duerfte.
```

Grenze:

```text
Keine Rollen-API.
Keine Rechte-API.
Keine Middleware.
Keine DB.
Keine Durchsetzung.
```

### 4. Confirm

Status:

```text
confirmPlanning: true
confirmActionMatrix: true
confirmDisplayBoundary: true
confirmApi: false
confirmToken: false
confirmDb: false
confirmRoute: false
confirmButton: false
confirmExecution: false
eventBusEmit: false
```

Rolle in der Sicherheitsarchitektur:

```text
Zusatzschutz fuer spaetere riskante Aktionen.
```

Grenze:

```text
Keine Confirm-API.
Keine Tokens.
Keine Buttons.
Keine Ausfuehrung.
```

## Gemeinsame Grundregel

Keiner der Bausteine darf allein eine riskante Aktion erlauben.

Eine spaetere Freigabe duerfte nur denkbar sein, wenn alle relevanten Bausteine OK sind:

```text
Roles/Rights OK
SafetyStop inactive/known
Guards OK
Preflight OK
Audit-Faehigkeit OK
Confirm OK, falls noetig
separate technische Freigabe OK
```

Aktueller Stand:

```text
Keine Freigabe.
Keine Ausfuehrung.
```

## Sicherheitsreihenfolge fuer spaeter

Eine spaetere high-risk Aktion muesste mindestens diese Reihenfolge durchlaufen:

```text
1. Request empfangen
2. Identity feststellen
3. Roles/Rights serverseitig pruefen
4. SafetyStop pruefen
5. Guards pruefen
6. Preflight pruefen
7. Audit-Faehigkeit pruefen
8. Confirm anfordern, falls noetig
9. erneute Safety-/Guard-/Preflight-Pruefung
10. separate Execute-Phase
11. Audit Result
```

Wichtig:

```text
CAN-19.0 baut keine dieser Phasen.
```

## Fail-safe-Gesamtregel

Wenn ein Baustein unbekannt, nicht verfuegbar oder widerspruechlich ist:

```text
blockieren
```

Beispiele:

```text
Rights unknown -> blockieren
SafetyStop unknown/degraded/active -> blockieren
Audit fuer high-risk nicht verfuegbar -> blockieren
Confirm erforderlich aber nicht verfuegbar -> blockieren
Guards/Preflight nicht OK -> blockieren
```

## Was weiterhin hart blockiert bleibt

```text
Alert Replay
Sound Replay
Queue Clear
Overlay State Repair
Execute Recovery
Auto Recovery
Auto Retry Overlay
Streamer.bot Action Retry
OBS Source Refresh
SafetyStop Clear
SafetyStop Reset
Audit Write Route
Audit Read Route
Confirm API
Confirm Execution
Rollen-/Rechte-Mutation
Prepare Route
Execute Route
POST Command Route
```

## Aktueller technischer Sicherheitsstand

```text
readOnly: true
canPrepare: false
canExecute: false
commandRoute: false
prepareRoute: false
executeRoute: false
recoveryExecution: false
dashboardRecoveryButtons: false
safetyStatusApi: false
backendSafetyStatusShapeImplemented: false
```

## Bestehende read-only Basis

Aktuell vorhanden und wichtig:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
Dashboard Safety Status View
Recovery Guards Anzeige
Manual Diagnostics Refresh read-only
Manual Status Resync read-only
```

## Architektur-Grenzen

CAN-19.0 bestaetigt:

```text
Keine produktive Recovery.
Keine automatische Selbstheilung mit produktiver Aktion.
Keine Replay-/Repair-/Clear-Aktion.
Keine neue API.
Keine neuen Routen.
Keine DB.
Keine Middleware.
Keine Dashboard-Aenderung.
```

## Empfohlene technische Reihenfolge fuer spaeter

Noch nicht freigegeben, nur Architekturplanung:

```text
1. Gemeinsame Safety Architecture Status Anzeige planen
2. Backend Status Shape fuer geplante Bausteine read-only planen
3. Dashboard Anzeige ohne Buttons planen
4. Danach ggf. einzelne read-only Statusquellen planen
5. Write-/Action-/Mutation-Phasen bleiben weiter blockiert
```

## Ergebnis CAN-19.0

CAN-19.0 definiert:

```text
Gesamtarchitektur aus Audit, SafetyStop, Roles/Rights und Confirm
gemeinsame Sicherheitsreihenfolge
Fail-safe-Gesamtregel
weiterhin harte Blocker
aktuelle technische Grenzen
empfohlene spaetere Reihenfolge
```

## Naechster sinnvoller Schritt

```text
CAN-19.1 - Safety Architecture Status Display Planning read-only/no-api
```
