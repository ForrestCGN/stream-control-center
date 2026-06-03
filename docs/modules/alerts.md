# Alerts Modul

## Kurzbeschreibung

Das Modul `alert_system` stellt das zentrale Alert-System bereit.

Die echte Backend-Datei heißt:

```text
backend/modules/alert_system.js
```

Das Modul verwaltet:

- Alert-Regeln
- Alert-Assets
- Alert-Queue
- Alert-Events
- Textvarianten
- Test-Presets
- Display-Profile
- Chat-Blöcke
- WebSocket-Overlay
- Overlay-Client-ACKs
- EventBus-/CanBus-Status
- Overlay-Watchdog
- Alert-/Sound-System-Korrelation

## Modulstand

- Backend-Datei: `backend/modules/alert_system.js`
- Modulname: `alert_system`
- Registry-Key: `alerts`
- Modulversion: `3.1.10`
- Build: `diagnostics-standard`
- Step: `365`
- Schema-Version: `6`
- Hauptprefix: `/api/alerts`

## Diagnose-Status CAN-43.9

CAN-43.9 hat das Modul nach dem neuen Diagnose-/Registry-Standard geprüft.

Ergebnis:

- Statusroute vorhanden.
- `diagnostics`-Block vorhanden.
- Health-Route vorhanden.
- Routenübersicht vorhanden.
- Integration-Check vorhanden.
- Registry-Coverage sauber.
- Live-Status sauber.
- Queue leer.
- Kein aktueller Alert.
- Overlay-Client verbunden.
- Keine Codeänderung nötig.

## Wichtige Read-only Routen

- `GET /api/alerts/status`
- `GET /api/alerts/health`
- `GET /api/alerts/routes`
- `GET /api/alerts/integration-check`
- `GET /api/alerts/config`
- `GET /api/alerts/settings`
- `GET /api/alerts/eventbus/status`
- `GET /api/alerts/eventbus/ack-status`
- `GET /api/alerts/bus-mirror/status`
- `GET /api/alerts/overlay-watchdog/status?check=0`
- `GET /api/alerts/events`
- `GET /api/alerts/stats`

## Produktive / schreibende / testauslösende Routen

Diese Routen sind produktiv oder können State verändern und wurden im CAN-43.9 Review nicht ausgelöst:

- Alert-Auslösung / Queue / Replay
- Upload-Routen
- Regel-/Asset-/Text-/DisplayProfile-/ChatBlock-POST-Routen
- EventBus-Test
- EventBus-Dry-Run
- Watchdog-Reset
- Bus-Mirror Enable/Disable
- Reload / Admin-Aktionen

## Bestätigte Live-Werte CAN-43.9

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

```text
diagnostics:
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

```text
counts:
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
```

```text
database:
ok=True
adapter=sqlite
path=D:\Streaming\stramAssets\data\sqlite\app.sqlite
schemaVersion=6
expectedSchemaVersion=6
error=
```

```text
integration-check:
ok=True
healthy=True
warnings={}
rules=30
displayProfiles=23
textVariants=16
testPresets=6
chatBlocks=9
rulesWithDesignProfile=27
rulesUsingDefaultProfile=3
defaultDisplayProfile=testfollow
```

## Hinweise

- Die produktive SQLite-Datenbank bleibt `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- Keine Funktionalität entfernen.
- Produktive Alert-/Upload-/Reset-/EventBus-Test-/Dry-Run-Routen nur bewusst und gezielt testen.
- Doku/project-state bei Änderungen aktualisieren.
