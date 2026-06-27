# CAN-43.10 Sound-System Diagnostics Review

Stand: 2026-06-03 14:00

## Ziel

Das Modul `sound_system` wurde als neuntes CAN-43-Fachmodul nach dem neuen Diagnose-/Registry-Standard geprüft und dokumentiert.

Dieser Step ist ein reiner Doku-/Abnahme-Step.

## Ergebnis

`sound_system` ist sauber.

- Repo/Live-Abgleich sauber.
- `sound_system` live aktiv/geladen.
- `GET /api/sound/status` vorhanden.
- `diagnostics`-Block vorhanden.
- `GET /api/sound/current` vorhanden.
- `GET /api/sound/queue` vorhanden.
- `GET /api/sound/routes` vorhanden.
- `GET /api/sound/integration-check` vorhanden.
- `GET /api/sound/eventbus/status` vorhanden.
- `GET /api/sound/eventbus/command/status` vorhanden.
- Registry-Eintrag `sound_system` vorhanden.
- Coverage sauber.
- Kein aktueller Sound.
- Queue leer.
- Keine parallelen Sounds.
- Overlay-Client verbunden.
- EventBus-Status read-only ok.
- Sound-Command-Status read-only ok.
- Keine Codeänderung nötig.

## Bestätigte Repo-/Live-Werte

```text
Branch: dev
HEAD: 2fa5874b CAN-43.9 Alerts diagnostics review
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
backend/modules/sound_system.js
```

`MODULE_META.name` ist `sound_system`.

Registry-Statusroute:

```text
/api/sound/status
```

## Statusroute

Geprüft:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
```

Ergebnis:

```text
ok=True
module=sound_system
moduleVersion=0.1.21
moduleBuild=diagnostics-standard
version=0.1.12
enabled=True
paused=False
current=
parallelCount=0
routeCount=36
```

## Diagnostics

```text
ok=True
health=ok
module=sound_system
version=0.1.21
build=diagnostics-standard
schemaVersion=1
schemaReady=True
lastError=
```

Counts:

```text
current=0
parallel=0
queued=0
activeBundleLock=0
configuredSounds=1
outputTargets=3
legacyTargets=3
allowedExtensions=6
settingsRows=10
routes=36
started=0
queuedTotal=0
stopped=0
skipped=0
failed=0
deviceStarted=0
deviceFailed=0
discordStarted=0
discordFailed=0
parallelStarted=0
bundlesQueued=0
bundleItemsQueued=0
levelCorrected=0
levelCorrectionSkipped=0
levelCorrectionFailed=0
soundBusEmitted=2
soundBusSkipped=0
soundBusErrors=0
soundBusCommandEmitted=0
soundBusCommandConsumed=0
soundBusCommandErrors=0
canBusHeartbeats=928
canBusStatusPublished=464
```

State:

```text
enabled=True
paused=False
phase=idle
clientConnected=True
clientLastEvent=ready
deviceLastOk=False
deviceLastAt=0
discordLastOk=False
discordLastAt=0
defaultTarget=stream
defaultOutputTarget=device
soundBusMode=bus_first
soundBusEnabled=True
soundBusCommandMode=dry_run
soundBusCommandConsumerMode=dry_run
canBusRegistered=True
```

Database:

```text
ok=True
adapter=sqlite
path=D:\Streaming\stramAssets\data\sqlite\app.sqlite
schemaVersion=1
expectedSchemaVersion=1
table=sound_settings
error=
```

## Current / Queue

Geprüft:

```powershell
$current = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/current"
$q = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/queue"
```

Ergebnis:

```text
current ok=True
current leer

queue ok=True
queue leer
```

## Routen

Geprüft:

```powershell
$sr = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/routes"
```

Ergebnis:

```text
ok=True
module=sound_system
routesVersion=1.1.0
```

Route-Notizen:

```text
DB settings override JSON fallback for allowed blocks.
output.targets is the active output-target model for overlay/device/both.
targets is kept for legacy stream/discord/both compatibility and must not be removed until all callers are migrated.
```

## Integration-Check

Geprüft:

```powershell
$si = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/integration-check"
```

Ergebnis:

```text
ok=True
module=sound_system
healthy=True
```

Warnungen:

```text
legacy_targets_and_output_targets_both_present
```

Bewertung der Warnung:

- Kein Fehler.
- `output.targets` ist das aktive Modell für overlay/device/both.
- `targets` bleibt bewusst für Legacy-Kompatibilität stream/discord/both erhalten.
- Die Route dokumentiert ausdrücklich, dass `targets` nicht entfernt werden darf, bis alle Caller migriert sind.
- Keine automatische Änderung.

Checks:

```text
enabled=True
paused=False
current=
queuedCount=0
parallelCount=0
clientConnected=True
clientLastEvent=ready
deviceLastOk=False
failed=0
deviceFailed=0
dbSettingsOk=True
dbSettingsCount=10
jsonConfigOk=True
outputTargets={overlay, device, both}
legacyTargets={stream, discord, both}
discordRoutingEnabled=True
discordRoutingTarget=both
defaultOutputTarget=device
overlayUrl=/overlays/sound_system_overlay.html
helperConfigured=True
helperExists=True
soundsBaseDir=D:\Streaming\stramAssets\htdocs\assets\sounds
soundsBaseDirExists=True
hasMp4=True
hasWebm=True
jsonPresetCount=1
```

Sources:

```text
json path=D:\Streaming\stramAssets\config\sound_system.json
json exists=True
json ok=True

database path=D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## EventBus-Status

Geprüft:

```powershell
$eb = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/status"
```

Ergebnis:

```text
ok=True
module=sound_system
version=0.1.21
enabled=True
channel=sound
communicationBusAvailable=True
```

## Sound-Command-Status

Geprüft:

```powershell
$cmd = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/status"
```

Ergebnis:

```text
ok=True
module=sound_system
version=0.1.21
enabled=True
channel=sound.command
```

## Nicht ausgelöst

Für diesen Review wurden ausschließlich read-only Endpunkte genutzt.

Nicht ausgelöst:

- kein Sound
- kein Beep
- kein Bundle
- kein Play-Test
- kein Dry-Run
- kein EventBus-Test
- kein Stop
- kein Skip
- kein Clear
- kein Pause
- kein Resume
- kein Reset
- keine Client-ACK-Routen
- keine DB-Änderung
- keine Textänderung
- keine Configänderung
- keine produktiven Flows

## Geänderte Dateien in CAN-43.10

- `docs/current/CAN-43.10_sound_system_diagnostics_review.md`
- `docs/current/CURRENT_CHAT_HANDOFF_CAN43_10.md`
- `docs/modules/SOUND_SYSTEM.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Tests nach Entpacken

```powershell
node -c backend\modules\sound_system.js
.\stepdone.cmd "CAN-43.10 Sound-System diagnostics review"
```
