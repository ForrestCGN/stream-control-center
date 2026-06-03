# OBS Modul

## Kurzbeschreibung

Das Modul `obs` stellt OBS API-Routen, Dashboard-Status und Source-/Scene-Control-Helper bereit.

Die echte Backend-Datei heißt:

```text
backend/modules/obs.js
```

Das Modul verwaltet:

- OBS-Verbindungsstatus
- OBS-Dashboard-Config
- Szenenliste
- Quellenliste
- Browserquellenliste
- Scene-Items
- Audio-Busy-State
- Replay-Status
- Filterlisten
- Produktive OBS-Aktionen über POST-Routen

## Modulstand

- Backend-Datei: `backend/modules/obs.js`
- Modulname: `obs`
- Registry-Key: `obs`
- Modulversion: `0.1.1`
- Build: `diagnostics-standard`
- Schema-Version: `0`
- Hauptprefix: `/api/obs`
- Legacy-Prefix: `/obs`

## Diagnose-Status CAN-43.12

CAN-43.12 hat das Modul nach dem neuen Diagnose-/Registry-Standard geprüft.

Ergebnis:

- Statusroute vorhanden.
- `diagnostics`-Block vorhanden.
- Health-Route vorhanden.
- Config-/Settings-Routen vorhanden.
- Routenübersicht vorhanden.
- Integration-Check vorhanden.
- Szenen-/Sources-/Browser-Sources-Routen vorhanden.
- Registry-Coverage sauber.
- OBS verbunden und erkannt.
- Keine Diagnostics-Warnings/Errors.
- Keine Codeänderung nötig.

## Wichtige Read-only Routen

- `GET /api/obs/status`
- `GET /api/obs/health`
- `GET /api/obs/config`
- `GET /api/obs/settings`
- `GET /api/obs/routes`
- `GET /api/obs/integration-check`
- `GET /api/obs/stats`
- `GET /api/obs/scenes`
- `GET /api/obs/sources`
- `GET /api/obs/browser-sources`
- `GET /api/obs/scene-items`
- `GET /api/obs/replay/status`
- `GET /api/obs/filter/list`
- `GET /api/obs/audio/busy`
- `GET /api/obs/audio/state`

## Produktive / ändernde Routen

Diese Routen sind produktiv oder können OBS-State verändern und wurden im CAN-43.12 Review nicht ausgelöst:

- `POST /api/obs/reload`
- `GET/POST /api/obs/dashboard/config` mit POST
- `POST /api/obs/scene/switch`
- `POST /api/obs/scene/preview`
- `POST /api/obs/source/show`
- `POST /api/obs/source/hide`
- `POST /api/obs/source/toggle`
- `POST /api/obs/audio/mute`
- `POST /api/obs/audio/unmute`
- `POST /api/obs/audio/toggle`
- `POST /api/obs/audio/volume`
- `POST /api/obs/media/action`
- `POST /api/obs/replay/start`
- `POST /api/obs/replay/stop`
- `POST /api/obs/replay/save`
- `POST /api/obs/filter/enable`
- `POST /api/obs/filter/disable`
- `POST /api/obs/filter/toggle`

## Bestätigte Live-Werte CAN-43.12

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

```text
status:
currentProgramSceneName=Live Gameplay Forrest
studioModeEnabled=False
streamActive=False
recordActive=False
recordPaused=False
replayBufferActive=False
lastError=
```

```text
diagnostics:
ok=True
health=ok
module=obs
version=0.1.1
build=diagnostics-standard
schemaVersion=0
schemaReady=True
lastError=
warnings leer
errors leer
```

```text
counts:
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

```text
integration-check:
total=7
ok=7
warnings=0
errors=0
```

## Hinweise

- Dieses Modul nutzt keine eigene DB-Schema-Migration; `database.adapter=none`, `schemaVersion=0`.
- OBS kann in späteren Checks warnen, wenn OBS geschlossen oder WebSocket nicht erreichbar ist.
- Keine Funktionalität entfernen.
- Produktive OBS-POST-Routen nur bewusst und gezielt testen.
- Doku/project-state bei Änderungen aktualisieren.
