# CAN-43.9 Alerts Diagnostics Review

Stand: 2026-06-03 13:45

## Ziel

Das Modul `alert_system` / Registry-Key `alerts` wurde als achtes CAN-43-Fachmodul nach dem neuen Diagnose-/Registry-Standard geprüft und dokumentiert.

Dieser Step ist ein reiner Doku-/Abnahme-Step.

## Ergebnis

`alerts` ist sauber.

- Repo/Live-Abgleich sauber.
- `alert_system` live aktiv/geladen.
- `GET /api/alerts/status` vorhanden.
- `diagnostics`-Block vorhanden.
- `GET /api/alerts/health` vorhanden.
- `GET /api/alerts/routes` vorhanden.
- `GET /api/alerts/integration-check` vorhanden.
- Registry-Eintrag `alerts` vorhanden.
- Coverage sauber.
- Queue leer.
- Kein aktueller Alert.
- Overlay-Client verbunden.
- EventBus-Status read-only ok.
- Overlay-Watchdog read-only ok.
- Keine Codeänderung nötig.

## Bestätigte Repo-/Live-Werte

```text
Branch: dev
HEAD: 6ec1efea CAN-43.8 VIP-Sound diagnostics review
Git-Status: sauber
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
backend/modules/alert_system.js
```

`MODULE_META.name` ist `alert_system`.

Registry-Alias:

```text
alert_system -> alerts
alerts -> alerts
```

Registry-Statusroute:

```text
/api/alerts/status
```

## Statusroute

Geprüft:

```powershell
$a = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status"
```

Ergebnis:

```text
ok=True
module=alert_system
moduleVersion=3.1.10
moduleBuild=diagnostics-standard
version=3
step=365
schemaVersion=6
enabled=True
queueLength=0
current=
overlayClients=1
```

## Diagnostics

```text
ok=True
health=ok
module=alert_system
version=3.1.10
build=diagnostics-standard
schemaVersion=6
expectedSchemaVersion=6
schemaReady=True
lastError=
```

Counts:

```text
types=16
rules=30
enabledRules=29
assets=48
soundAssets=32
imageAssets=16
soundAssetsWithDuration=32
soundAssetsWithoutDuration=0
events=1039
eventsLast24h=13
textVariants=16
testPresets=6
displayProfiles=23
chatBlocks=9
queueLength=0
history=0
overlayClients=1
routes=66
alertOutputBusEmitted=0
alertOutputLegacyEmitted=0
alertOutputSkipped=0
alertOutputErrors=0
alertBusMirrorEmitted=0
alertBusMirrorSkipped=0
alertBusMirrorErrors=0
alertEventBusEmitted=0
alertEventBusSkipped=0
alertEventBusErrors=0
canBusHeartbeats=892
canBusStatusPublished=444
soundBundlesPrepared=0
soundBundlesPosted=0
soundBundlesOk=0
soundBundlesFailed=0
```

State:

```text
enabled=True
overlayEnabled=True
queueEnabled=True
uploadEnabled=True
processing=False
hasCurrent=False
currentEventId=
queueLength=0
overlayClients=1
multerReady=True
ffprobeAvailable=True
canBusRegistered=True
alertBusMirrorEnabled=False
alertEventBusLastAction=
alertOutputLastMode=
```

Database:

```text
ok=True
adapter=sqlite
path=D:\Streaming\stramAssets\data\sqlite\app.sqlite
schemaVersion=6
expectedSchemaVersion=6
error=
```

## Health

Geprüft:

```powershell
$h = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/health"
```

Ergebnis:

```text
ok=True
module=alert_system
status.ok=True
status.module=alert_system
status.moduleVersion=3.1.10
status.moduleBuild=diagnostics-standard
status.version=3
status.diagnosticVersion=3.1.10
status.step=365
status.enabled=True
status.queueLength=0
status.overlayClients=1
status.routeCount=66
```

## EventBus-Status

Geprüft:

```powershell
$eb = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/status"
```

Ergebnis:

```text
ok=True
module=alert_system
version=3.1.10
enabled=True
channel=alert.status
communicationBusAvailable=True
```

## Overlay-Watchdog

Geprüft read-only ohne aktiven Check:

```powershell
$aw = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/overlay-watchdog/status?check=0"
```

Ergebnis:

```text
ok=True
module=alert_system
enabled=True
```

## Routen

Geprüft:

```powershell
$routes = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/routes"
```

Ergebnis:

```text
ok=True
module=alert_system
version=1
standardPrefix=/api/alerts
count=66
```

Notizen aus der Route:

```text
Read-only Routenübersicht für Dashboard-/Modul-Standardisierung.
Bestehende Routen wurden nicht geändert.
Schreibende Routen sind nur dokumentiert, nicht neu angelegt.
Security bleibt über bestehende local_or_auth Guards geregelt.
```

Security:

```text
enabled=True
allowLocalhostWithoutAuth=True
allowConfiguredNetworksWithoutAuth=True
allowAllPrivateNetworksWithoutAuth=False
requireAuthForExternal=True
blockExternalWithoutAuth=True
clientIp=127.0.0.1
clientAllowed=True
hasConfiguredAuthTokens=True
```

## Integration-Check

Geprüft:

```powershell
$ai = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/integration-check"
```

Ergebnis:

```text
ok=True
healthy=True
warnings={}
```

Counts:

```text
rules=30
displayProfiles=23
textVariants=16
testPresets=6
chatBlocks=9
rulesWithDesignProfile=27
rulesUsingDefaultProfile=3
```

Default Display Profile:

```text
id=3
name=testfollow
```

## Nicht ausgelöst

Für diesen Review wurden ausschließlich read-only Endpunkte genutzt.

Nicht ausgelöst:

- kein Alert
- kein Sound
- kein Overlay-Play
- kein EventBus-Test
- kein EventBus-Dry-Run
- kein Watchdog-Reset
- kein Bus-Mirror Enable/Disable
- kein Upload
- keine Regeländerung
- keine DB-Änderung
- keine Textänderung
- keine Configänderung
- keine produktiven Flows

## Geänderte Dateien in CAN-43.9

- `docs/current/CAN-43.9_alerts_diagnostics_review.md`
- `docs/current/CURRENT_CHAT_HANDOFF_CAN43_9.md`
- `docs/modules/ALERTS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Tests nach Entpacken

```powershell
node -c backend\modules\alert_system.js
.\stepdone.cmd "CAN-43.9 Alerts diagnostics review"
```
