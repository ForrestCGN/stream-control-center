# CAN-43.14 Bus Diagnostics Review

Stand: 2026-06-03 14:45

## Ziel

Das Modul `bus_diagnostics` wurde als dreizehntes CAN-43-Fachmodul nach dem neuen Diagnose-/Registry-Standard geprüft und dokumentiert.

Dieser Step ist ein reiner Doku-/Abnahme-Step auf Basis des Batch-Exports:

```text
CAN-43_batch_20260603_141339.zip
```

## Ergebnis

`bus_diagnostics` ist sauber.

- Repo/Live-Abgleich sauber.
- `bus_diagnostics` live aktiv/geladen.
- `GET /api/bus-diagnostics/status` vorhanden.
- `GET /api/bus-diagnostics/routes` vorhanden.
- Registry-Eintrag `bus_diagnostics` vorhanden.
- Coverage sauber.
- Modus read-only.
- Keine Flows/Queues/Systeme produktiv berührt.
- Summary-Status `ok`.
- Keine Warnings.
- Keine Errors.
- Optionale Hinweise nur für nicht verbundene Debug-Clients.
- Keine Codeänderung nötig.

## Bestätigte Repo-/Live-Werte

```text
Branch: dev
HEAD: 688f7da7 CAN-43.12 OBS diagnostics review
Git-Status: diagnostics_exports/ untracked durch Batch-Export
```

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
backend/modules/bus_diagnostics.js
```

`MODULE_META.name` ist `bus_diagnostics`.

Registry-Statusroute:

```text
/api/bus-diagnostics/status
```

## Statusroute

Geprüft:

```powershell
$bdStatus = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
```

Ergebnis:

```text
ok=True
module=bus_diagnostics
version=1.2.9
statusApiVersion=1.0.0
feature=bus_dashboard_diagnostics
mode=read_only_dashboard_preparation
readOnly=True
requestedCheck=False
flowTouched=False
queueTouched=False
soundSystemTouched=False
alertSystemTouched=False
vipSystemTouched=False
overlayTouched=False
durationMs=99
baseUrl=http://127.0.0.1:8080
```

## Summary

```text
communicationOk=True
soundBusOk=True
alertBusOk=True
correlationOk=True
vipOk=True
vipIntegrationOk=True
connectedClients=16
totalClients=16
soundDebugConnected=False
alertDebugConnected=False
vipOverlayConnected=True
soundEmitted=2
soundErrors=0
soundLastAction=client.ready
alertEmitted=0
alertErrors=0
vipVersion=1.8.15
vipPhase=idle
vipVisible=False
vipActive=False
vipQueuedCount=0
vipClientConnected=True
vipDbInitialized=True
vipIntegrationErrors=0
correlationMatched=0
correlationUnmatched=0
handshakeState=idle_no_recent_handshake
handshakeOk=True
handshakeWarning=False
matrixRows=8
matrixOk=True
matrixWarnings=0
matrixErrors=0
recoveryStrategyMode=read_only
recoveryStrategyState=idle
recoveryAllowedActions=1
recoveryBlockedActions=4
recoveryReadinessStatus=ready
recoveryReadinessCanStartReadOnlyCode=True
recoveryPreflightStatus=ready
recoveryPreflightCanPrepare=False
recoveryPreflightCanExecute=False
recoveryPreflightCheckCount=13
recoveryPreflightBlockingCheckCount=0
recoveryPreflightWarningCheckCount=0
recoveryPreflightScopeCount=6
optionalInfoCount=2
status=ok
```

Warnings / Errors:

```text
warnings=[]
errors=[]
```

Optionale Hinweise:

```text
sound_eventbus_debug_not_connected_optional
alert_eventbus_debug_not_connected_optional
```

Bewertung:

- Kein Fehler.
- Debug-Clients sind optional.
- Hauptsysteme sind ok.
- Status bleibt `ok`.

## Aggregierte Endpunkte

Das Modul prüft intern read-only:

```text
/api/communication/status
/api/sound/eventbus/status
/api/sound/status
/api/alerts/eventbus/status
/api/alerts/status
/api/alerts/eventbus/correlation/status
/api/vip-sound/status
/api/vip-sound/integration-check
```

## Routen

Geprüft:

```powershell
$bdRoutes = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/routes"
```

Ergebnis:

```text
ok=True
module=bus_diagnostics
version=1.2.9
statusApiVersion=1.0.0
```

Routen:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/check
GET /api/bus-diagnostics/recovery-preflight
GET /api/bus-diagnostics/routes
GET /api/bus-diagnostics/recovery-simulation/status
GET /api/bus-diagnostics/recovery-simulation/test?scenario=missingAck
```

Hinweis:

Die im ersten Batch zusätzlich abgefragten URLs

```text
/api/bus-diagnostics/health
/api/bus-diagnostics/summary
```

existieren nicht und sind für das Modul auch nicht als Route dokumentiert.

## Nicht ausgelöst

Für diesen Review wurden ausschließlich read-only Endpunkte genutzt.

Nicht ausgelöst:

- kein Flow
- keine Queue
- kein Sound-System
- kein Alert-System
- kein VIP-System
- kein Overlay
- keine Recovery-Aktion
- keine produktive Simulation mit Seiteneffekt
- keine DB-Änderung
- keine Textänderung
- keine Configänderung
- keine produktiven Flows

## Geänderte Dateien in CAN-43.14

- `docs/current/CAN-43.14_bus_diagnostics_review.md`
- `docs/current/CURRENT_CHAT_HANDOFF_CAN43_14.md`
- `docs/modules/BUS_DIAGNOSTICS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Tests nach Entpacken

```powershell
node -c backend\modules\bus_diagnostics.js
.\stepdone.cmd "CAN-43.13-43.14 Overlay-Monitor and Bus-Diagnostics reviews"
```
