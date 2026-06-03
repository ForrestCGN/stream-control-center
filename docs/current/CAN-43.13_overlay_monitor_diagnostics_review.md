# CAN-43.13 Overlay Monitor Diagnostics Review

Stand: 2026-06-03 14:45

## Ziel

Das Modul `overlay_monitor` wurde als zwölftes CAN-43-Fachmodul nach dem neuen Diagnose-/Registry-Standard geprüft und dokumentiert.

Dieser Step ist ein reiner Doku-/Abnahme-Step auf Basis des Batch-Exports:

```text
CAN-43_batch_20260603_141339.zip
```

## Ergebnis

`overlay_monitor` ist sauber.

- Repo/Live-Abgleich sauber.
- `overlay_monitor` live aktiv/geladen.
- `GET /api/overlay-monitor/status` vorhanden.
- `diagnostics`-Block vorhanden.
- `GET /api/overlay-monitor/client-control/status` vorhanden.
- `GET /api/overlay-monitor/client-control/classification` vorhanden.
- `GET /api/overlay-monitor/client-control/identity-contract` vorhanden.
- `GET /api/overlay-monitor/issues` vorhanden.
- `GET /api/overlay-monitor/obs-inventory?cache=1` vorhanden.
- `GET /api/overlay-monitor/events` vorhanden.
- `GET /api/overlay-monitor/routes` vorhanden.
- Registry-Eintrag `overlay_monitor` vorhanden.
- Coverage sauber.
- Keine aktiven Issues.
- Keine Diagnostics-Warnings/Errors.
- Keine OBS-Reparatur ausgelöst.
- Keine Browserquelle refreshed.
- Keine Codeänderung nötig.

## Bestätigte Repo-/Live-Werte

```text
Branch: dev
HEAD: 688f7da7 CAN-43.12 OBS diagnostics review
Git-Status: diagnostics_exports/ untracked durch Batch-Export
```

Hinweis:

```text
?? diagnostics_exports/
```

Das ist der lokal erzeugte Exportordner und keine Projektänderung.

```text
diagnostics registry coverage:
ok=True
registryEntries=14
loadedModules=52
coveredLoadedModules=14
missingLoadedModules=0
registryOnlyEntries=0
```

## Datei-/Registry-Hinweis

Die echte Backend-Datei heißt:

```text
backend/modules/overlay_monitor.js
```

`MODULE_META.name` ist `overlay_monitor`.

Registry-Statusroute:

```text
/api/overlay-monitor/status
```

## Statusroute

Geprüft:

```powershell
$om = Invoke-RestMethod "http://127.0.0.1:8080/api/overlay-monitor/status?events=20"
```

Ergebnis:

```text
ok=True
module=overlay_monitor
moduleVersion=0.1.9
moduleBuild=diagnostics-standard
version=0.1.9
diagnosticVersion=0.1.9
statusApiVersion=1.0.9
feature=overlay_monitor_read_only
readOnly=True
overlayTouched=False
obsTouched=False
refreshTouched=False
routeCount=9
```

Summary:

```text
total=10
online=7
registered=0
stale=0
offline=0
dead=0
expectedInactive=1
expectedIdle=2
expectedNotActive=3
withHeartbeat=10
withoutHeartbeat=0
connected=10
disconnected=0
activeExpected=8
inactiveExpected=3
withErrors=0
status=ok
```

Communication:

```text
available=True
ok=True
bus=cgn
version=1
clientCount=16
```

Scene Awareness:

```text
inventoryAvailable=True
inventoryOk=True
inventoryUpdatedAt=2026-06-03T10:43:56.755Z
inventoryFromCache=False
inventoryFromMemory=False
refreshError=
currentProgramSceneName=Live Gameplay Forrest
currentPreviewSceneName=
currentProgramSceneKnown=True
sceneAwarenessMode=program_scene_known
sceneCount=18
sourceCount=111
```

## Diagnostics

```text
ok=True
health=ok
module=overlay_monitor
version=0.1.9
build=diagnostics-standard
schemaVersion=1
schemaReady=True
lastError=
```

Counts:

```text
overlays=10
online=7
registered=0
stale=0
offline=0
dead=0
expectedInactive=1
expectedIdle=2
expectedNotActive=3
withHeartbeat=10
withoutHeartbeat=0
connected=10
disconnected=0
activeIssues=0
recentEvents=10
busClients=16
inventoryScenes=18
inventorySources=111
storedIssues=4262
inventoryCacheRows=1
routes=9
scans=1052
statusChanges=0
obsRepairActions=0
issuesActivated=0
issuesResolved=0
issuesTouched=0
busErrors=0
issueDbErrors=0
inventoryDbErrors=0
inventoryRefreshes=1
inventoryCacheHits=2
consoleLogsSuppressed=10
```

State:

```text
enabled=True
readOnly=True
loadedAt=2026-06-03T10:43:56.257Z
lastScanAt=2026-06-03T12:11:37.925Z
monitorIntervalMs=5000
publishStatusToBus=True
emitStatusChangesToBus=True
communicationAvailable=True
communicationOk=True
currentProgramSceneName=Live Gameplay Forrest
currentProgramSceneKnown=True
sceneAwarenessMode=program_scene_known
inventoryAvailable=True
inventoryOk=True
inventoryFromCache=False
inventoryFromMemory=False
inventoryUpdatedAt=2026-06-03T10:43:56.755Z
```

Database:

```text
ok=True
adapter=sqlite
schemaVersion=1
expectedSchemaVersion=1
issueSchemaVersion=1
inventorySchemaVersion=1
issuesTable=monitoring_issues
inventoryTable=monitoring_obs_inventory_cache
error=
```

Diagnostics:

```text
warnings leer
errors leer
```

## Client-Control

Geprüft:

```powershell
$cc = Invoke-RestMethod "http://127.0.0.1:8080/api/overlay-monitor/client-control/status"
```

Ergebnis:

```text
ok=True
module=overlay_monitor
version=0.1.9
statusApiVersion=1.0.9
feature=overlay_client_control_status
mode=read_only_overlay_clients
readOnly=True
overlayTouched=False
obsTouched=False
obsRefreshTriggered=False
obsRepairTriggered=False
eventBusEmit=False
recoveryTriggered=False
```

Summary:

```text
total=10
online=7
info=3
warning=0
error=0
heartbeat=10
stale=0
dead=0
expectedInactive=1
expectedIdle=2
expectedNotActive=3
activeExpected=8
productiveHint=10
testOrLegacyHint=0
```

Safety:

```text
clientControlTouchesObs=False
clientControlRefreshesBrowserSources=False
clientControlRepairsObs=False
manualRepairRouteExistsButNotUsedHere=True
automaticRecovery=False
```

## Classification / Identity Contract

Classification:

```text
total=10
productiveCandidates=10
testOrLegacy=0
unknown=0
highConfidence=8
mediumConfidence=2
lowConfidence=0
```

Identity Contract:

```text
total=10
normalized=10
duplicates=0
productiveCandidates=10
testOrLegacy=0
unknown=0
capabilityKinds=34
```

Contract:

```text
idFormat=overlay:<stable-id>
requiredHeartbeatFields=clientId,module,clientType,capabilities
recommendedSourceShape=type=overlay,id=overlay:<stable-id>,module=<module-name>
```

## Issues

Geprüft:

```powershell
$issues = Invoke-RestMethod "http://127.0.0.1:8080/api/overlay-monitor/issues?status=all&limit=100"
```

Ergebnis:

```text
ok=True
module=overlay_monitor
version=0.1.9
table=monitoring_issues
status=all
active=0
resolved=4262
total=4262
```

Bewertung:

- Keine aktiven Issues.
- Historische/resolved Issues bleiben dokumentiert.
- Kein Cleanup ausgelöst.

## OBS-Inventar

Geprüft:

```powershell
$inv = Invoke-RestMethod "http://127.0.0.1:8080/api/overlay-monitor/obs-inventory?cache=1"
```

Ergebnis:

```text
ok=True
module=overlay_monitor
version=0.1.9
feature=obs_overlay_inventory
readOnly=True
fromCache=False
currentProgramSceneName=Live Gameplay Forrest
currentProgramSceneKnown=True
sceneCount=18
sourceCount=111
summary.scenes=18
summary.sources=111
summary.visible=89
summary.cgn=80
summary.external=24
summary.placeholder=7
summary.withBus=0
summary.warnings=8
```

Bewertung:

- Inventar ist verfügbar und ok.
- Die Inventory-Warnungen sind Inventar-/Source-Klassifizierungen, nicht aktive Diagnostics-Fehler.
- Status/Diagnostics selbst bleiben `health=ok`, `warnings=[]`, `errors=[]`.

## Events / Routes

Events:

```text
ok=True
module=overlay_monitor
version=0.1.9
stats.obsRepairActions=0
stats.busErrors=0
stats.issueDbErrors=0
stats.inventoryDbErrors=0
stats.lastError=
```

Routes:

```text
routeCount=9
```

Routen:

```text
GET  /api/overlay-monitor/status
GET  /api/overlay-monitor/client-control/status
GET  /api/overlay-monitor/client-control/classification
GET  /api/overlay-monitor/client-control/identity-contract
GET  /api/overlay-monitor/issues
GET  /api/overlay-monitor/obs-inventory
POST /api/overlay-monitor/obs-source/action
GET  /api/overlay-monitor/events
GET  /api/overlay-monitor/routes
```

## Nicht ausgelöst

Für diesen Review wurden ausschließlich read-only Endpunkte genutzt.

Nicht ausgelöst:

- keine OBS-Reparatur
- kein Browserquellen-Refresh
- kein Source Show/Hide/Toggle
- keine Recovery-Aktion
- keine manuelle Reparaturroute
- keine DB-Änderung
- keine Textänderung
- keine Configänderung
- keine produktiven Flows

## Geänderte Dateien in CAN-43.13

- `docs/current/CAN-43.13_overlay_monitor_diagnostics_review.md`
- `docs/modules/OVERLAY_MONITOR.md`

Die gemeinsamen Projekt-/Handoff-Dateien werden im Batch-Step CAN-43.14 aktualisiert.

## Tests nach Entpacken

```powershell
node -c backend\modules\overlay_monitor.js
```
