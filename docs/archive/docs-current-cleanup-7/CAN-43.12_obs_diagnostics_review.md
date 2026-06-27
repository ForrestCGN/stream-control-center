# CAN-43.12 OBS Diagnostics Review

Stand: 2026-06-03 14:30

## Ziel

Das Modul `obs` wurde als elftes CAN-43-Fachmodul nach dem neuen Diagnose-/Registry-Standard geprüft und dokumentiert.

Dieser Step ist ein reiner Doku-/Abnahme-Step.

## Ergebnis

`obs` ist sauber.

- Repo/Live-Abgleich sauber.
- `obs` live aktiv/geladen.
- `GET /api/obs/status` vorhanden.
- `diagnostics`-Block vorhanden.
- `GET /api/obs/health` vorhanden.
- `GET /api/obs/config` vorhanden.
- `GET /api/obs/settings` vorhanden.
- `GET /api/obs/routes` vorhanden.
- `GET /api/obs/integration-check` vorhanden.
- `GET /api/obs/scenes` vorhanden.
- `GET /api/obs/sources` vorhanden.
- `GET /api/obs/browser-sources` vorhanden.
- Registry-Eintrag `obs` vorhanden.
- Coverage sauber.
- OBS verbunden und erkannt.
- Keine Diagnostics-Warnings/Errors.
- Keine Codeänderung nötig.

## Bestätigte Repo-/Live-Werte

```text
Branch: dev
HEAD: f42053a1 CAN-43.11 Media diagnostics review
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
backend/modules/obs.js
```

`MODULE_META.name` ist `obs`.

Registry-Statusroute:

```text
/api/obs/status
```

Legacy-Prefix bleibt verfügbar:

```text
/obs
```

## Statusroute

Geprüft:

```powershell
$o = Invoke-RestMethod "http://127.0.0.1:8080/api/obs/status"
```

Ergebnis:

```text
ok=True
module=obs
moduleVersion=0.1.1
moduleBuild=diagnostics-standard
version=0.1.1
diagnosticVersion=0.1.1
enabled=True
obsConnected=True
obsDetected=True
routeCount=32
```

Statusdaten:

```text
obsConnected=True
obsDetected=True
obsConnecting=False
currentProgramSceneName=Live Gameplay Forrest
currentPreviewSceneName=
studioModeEnabled=False
streamActive=False
recordActive=False
recordPaused=False
replayBufferActive=False
lastError=
lastCheck=1780488426282
```

## Diagnostics

```text
ok=True
health=ok
module=obs
version=0.1.1
build=diagnostics-standard
schemaVersion=0
schemaReady=True
lastError=
```

Counts:

```text
routes=32
scenes=18
sourceAliases=0
sceneAliases=0
audioActive=0
obsConnected=1
obsDetected=1
obsConnecting=0
streamActive=0
recordActive=0
recordPaused=0
replayBufferActive=0
```

State:

```text
obsUrl=ws://127.0.0.1:4455
obsConnected=True
obsConnecting=False
obsDetected=True
currentProgramSceneName=Live Gameplay Forrest
currentPreviewSceneName=
studioModeEnabled=False
streamActive=False
recordActive=False
recordPaused=False
replayBufferActive=False
lastCheck=1780488426282
audioBusy=False
audioActive={}
```

Database:

```text
enabled=False
adapter=none
schemaVersion=0
expectedSchemaVersion=0
schemaReady=True
lastError=
```

Diagnostics:

```text
warnings leer
errors leer
```

## Health

Geprüft:

```powershell
$h = Invoke-RestMethod "http://127.0.0.1:8080/api/obs/health"
```

Ergebnis:

```text
connected=True
detected=True
lastCheck=1780488426282
```

## Config / Settings

Geprüft:

```powershell
$cfg = Invoke-RestMethod "http://127.0.0.1:8080/api/obs/config"
$set = Invoke-RestMethod "http://127.0.0.1:8080/api/obs/settings"
```

Dashboard-Config:

```text
path=D:\Streaming\stramAssets\config\obs_dashboard.json
exists=True
ok=True
autoRefreshEnabled=True
fastRefreshMs=2000
fullRefreshMs=5000
showStatusLine=True
showPerformance=True
showOverview=True
hideInternalScenesOnMain=True
```

Shared Settings:

```text
obsUrl=ws://127.0.0.1:4455
obsConnected=True
obsConnecting=False
obsDetected=True
currentProgramSceneName=Live Gameplay Forrest
studioModeEnabled=False
streamActive=False
recordActive=False
replayBufferActive=False
obsSceneCount=18
lastError=
sourceAliasCount=0
sceneAliasCount=0
```

## Routen

Geprüft:

```powershell
$or = Invoke-RestMethod "http://127.0.0.1:8080/api/obs/routes"
```

Ergebnis:

```text
ok=True
module=obs
route=/api/obs/routes
prefix=/api/obs
legacyPrefix=/obs
count=32
```

## Integration-Check

Geprüft:

```powershell
$oi = Invoke-RestMethod "http://127.0.0.1:8080/api/obs/integration-check"
```

Ergebnis:

```text
ok=True
module=obs
route=/api/obs/integration-check
summary total=7 ok=7 warnings=0 errors=0
```

Checks:

```text
obs_dashboard_config=True ok
shared_snapshot=True ok
obs_detected=True ok
obs_connected=True ok
obs_scenes=True ok count=18
dashboard_config=True ok
routes=True ok count=32
```

Notes:

```text
This integration check is non-destructive.
OBS connection warnings are expected when OBS is closed or WebSocket is unavailable.
Productive prefix remains /api/obs; legacy /obs routes remain available.
```

## Szenen / Sources

Geprüft:

```powershell
$sc = Invoke-RestMethod "http://127.0.0.1:8080/api/obs/scenes"
$src = Invoke-RestMethod "http://127.0.0.1:8080/api/obs/sources"
$bs = Invoke-RestMethod "http://127.0.0.1:8080/api/obs/browser-sources"
```

Szenen:

```text
currentProgramSceneName=Live Gameplay Forrest
currentPreviewSceneName=
sceneCount=18
```

Bestätigte Szenen:

```text
Ende
Pause
Live Gameplay Engel
Live Gameplay Engel&Forrest
Live Gameplay Forrest&Engel
Live Gameplay Forrest
Start
----------------------------------
_Videos&Clips
_Forrest-Fenster
_Forrest
_Engel-Fenster
_Engel
_Overlay-Deathcounter
_Firework
_Audio
_Alerts
_Sound-Switches
```

Sources:

```text
Erste 20 Inputs wurden gelesen.
Browser-Sources count=17.
```

## Replay-Status

Der separat angefragte `GET /api/obs/replay/status`-Block wurde in der gelieferten Konsolenausgabe nicht mehr ausgeführt oder nicht mehr angezeigt.

Der relevante Replay-Zustand ist dennoch in Status/Diagnostics enthalten:

```text
replayBufferActive=False
```

Keine Replay-Start/Stop/Save-Route wurde ausgelöst.

## Nicht ausgelöst

Für diesen Review wurden ausschließlich read-only Endpunkte genutzt.

Nicht ausgelöst:

- kein Szenenwechsel
- keine Preview-Szene gesetzt
- keine Studio-Transition
- keine Source gezeigt/versteckt/getoggelt
- kein Audio mute/unmute/toggle/volume
- keine Media-Action
- kein Replay Start/Stop/Save
- kein Filter enable/disable/toggle
- keine Dashboard-Config geschrieben
- kein Reload
- keine OBS-produktiven Flows

## Geänderte Dateien in CAN-43.12

- `docs/current/CAN-43.12_obs_diagnostics_review.md`
- `docs/current/CURRENT_CHAT_HANDOFF_CAN43_12.md`
- `docs/modules/OBS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Tests nach Entpacken

```powershell
node -c backend\modules\obs.js
.\stepdone.cmd "CAN-43.12 OBS diagnostics review"
```
