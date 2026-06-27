# CAN-43.15 Communication Bus Diagnostics Review

Stand: 2026-06-03 15:00

## Ziel

Das Modul `communication_bus` wurde als vierzehntes CAN-43-Fachmodul nach dem neuen Diagnose-/Registry-Standard geprüft und dokumentiert.

Dieser Step ist ein reiner Doku-/Abnahme-Step auf Basis des Mini-Exports:

```text
CAN-43_communication_20260603_141844.zip
```

## Ergebnis

`communication_bus` ist sauber.

- Repo/Live-Abgleich sauber.
- `communication_bus` live aktiv/geladen.
- `GET /api/communication/status` vorhanden.
- Statusroute enthält Routenliste, Clients, Events und Diagnostics.
- `diagnostics`-Block vorhanden.
- Registry-Eintrag `communication_bus` vorhanden.
- Coverage sauber.
- Bus `cgn` läuft.
- 16 Clients verbunden.
- 16 Clients mit Heartbeat.
- 0 Issues.
- 0 Dropped Events.
- 0 Subscriber-Errors.
- 0 Audit-Errors.
- Keine Diagnostics-Warnings/Errors.
- Keine Codeänderung nötig.

## Bestätigte Repo-/Live-Werte

```text
Branch: dev
HEAD: 1915631 CAN-43.13-43.14 Overlay-Monitor and Bus-Diagnostics reviews
Git-Status: diagnostics_exports/ untracked durch Mini-Export
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
backend/modules/communication_bus.js
```

`MODULE_META.name` ist `communication_bus`.

Registry-Statusroute:

```text
/api/communication/status
```

## Statusroute

Geprüft:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
```

Ergebnis:

```text
ok=True
module=communication_bus
moduleVersion=0.8.4
moduleBuild=diagnostics-standard
version=0.8.4
diagnosticVersion=0.8.4
coreName=communication_core
coreVersion=0.3.0
enabled=True
bus=cgn
busVersion=1
routeCount=18
```

Data Endpoints:

```text
status=/api/communication/status
settings=/api/communication/settings
test=/api/communication/test
watchdog=/api/communication/watchdog
replay=/api/communication/replay
issues=/api/communication/issue
reset=/api/communication/reset
```

## Diagnostics

```text
ok=True
health=ok
module=communication_bus
version=0.8.4
build=diagnostics-standard
schemaVersion=1
schemaReady=True
coreName=communication_core
coreVersion=0.3.0
lastError=
```

Counts:

```text
clients=16
connectedClients=16
disconnectedClients=0
overlayClients=10
clientsWithHeartbeat=16
events=10
replayableEvents=9
ackRequiredEvents=0
issues=0
errorIssues=0
subscriptions=2
settingsRows=31
settingDefinitions=31
routes=18
emitted=2859
delivered=17091
acks=568
replays=0
dropped=0
subscriberDeliveries=0
subscriberErrors=0
auditWrites=0
auditSkipped=3427
auditErrors=0
```

State:

```text
enabled=True
bus=cgn
busVersion=1
phase=running
createdAt=2026-06-03T10:43:55.688Z
now=2026-06-03T12:18:44.111Z
securityAvailable=True
securityEnabled=True
auditAvailable=False
auditEnabled=False
wsClientRegistrationEnabled=True
wsAcksEnabled=True
```

Database:

```text
ok=True
adapter=sqlite
path=D:\Streaming\stramAssets\data\sqlite\app.sqlite
schemaVersion=1
expectedSchemaVersion=1
table=communication_bus_settings
error=
```

Diagnostics:

```text
warnings=[]
errors=[]
```

## Bus-Status Details

Bus:

```text
ok=True
bus=cgn
version=1
enabled=True
createdAt=2026-06-03T10:43:55.688Z
now=2026-06-03T12:18:44.111Z
```

Stats:

```text
emitted=2859
delivered=17091
acks=568
replays=0
dropped=0
issues=0
subscriptions=2
subscriberDeliveries=0
subscriberErrors=0
auditWrites=0
auditSkipped=3427
auditErrors=0
```

Hooks:

```text
securityAvailable=True
securityEnabled=True
auditAvailable=False
auditEnabled=False
```

## Clients / Events / Subscriptions / Issues

```text
clients=16
events=10
subscriptions=2
issues=0
```

Client-Zusammenfassung:

```text
connected=16
withHeartbeat=16
overlays=10
modules=6
```

## Routen

Die Statusroute enthält die vollständige Routenliste.

Bestätigte RouteCount:

```text
routeCount=18
```

Wichtige Read-only-Routen:

```text
GET /api/communication/status
GET /api/communication/settings
GET /api/event-bus/settings
GET /api/communication/watchdog
GET /api/communication/issue
GET /api/communication/replay
GET /api/communication/ack
```

Produktive / testauslösende / ändernde Routen:

```text
POST /api/communication/settings
POST /api/event-bus/settings
POST /api/communication/settings/reset-defaults
POST /api/event-bus/settings/reset-defaults
GET  /api/communication/test
GET  /api/communication/test-alert
GET  /api/communication/mirror-alert
GET  /api/communication/client/forget
GET  /api/communication/test-vip-overlay-preview
GET  /api/communication/test-vip-overlay
GET  /api/communication/reset
```

Diese produktiven/testauslösenden Routen wurden nicht aufgerufen.

## Nicht vorhandene Einzelrouten aus Mini-Export

Folgende URLs wurden geprüft und lieferten 404:

```text
/api/communication/routes
/api/communication/clients
/api/communication/diagnostics
```

Bewertung:

- Kein Fehler.
- Diese Einzelrouten sind nicht dokumentiert.
- Die Statusroute `/api/communication/status` bündelt Routen, Clients und Diagnostics vollständig.
- Keine Codeänderung nötig.

## Nicht ausgelöst

Für diesen Review wurde nur die read-only Statusroute produktiv ausgewertet.

Nicht ausgelöst:

- kein Testevent
- kein Testalert
- kein Alert-Mirror
- kein VIP-Overlay-Test
- kein Client-Forget
- kein Reset
- keine Settings-Änderung
- kein Replay-Abruf mit produktiver Wirkung
- keine DB-Änderung
- keine Textänderung
- keine Configänderung
- keine produktiven Flows

## Geänderte Dateien in CAN-43.15

- `docs/current/CAN-43.15_communication_bus_diagnostics_review.md`
- `docs/current/CURRENT_CHAT_HANDOFF_CAN43_15.md`
- `docs/modules/COMMUNICATION_BUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Tests nach Entpacken

```powershell
node -c backend\modules\communication_bus.js
.\stepdone.cmd "CAN-43.15 Communication-Bus diagnostics review"
```
