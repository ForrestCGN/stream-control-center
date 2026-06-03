# Sound-System Modul

## Kurzbeschreibung

Das Modul `sound_system` stellt das zentrale Sound-System bereit.

Die echte Backend-Datei heißt:

```text
backend/modules/sound_system.js
```

Das Modul verwaltet:

- Sound-Queue
- aktuelle Wiedergabe
- parallele Sounds
- Overlay-/Device-Ausgabe
- Sound-Bundles
- EventBus-Status
- Sound-Command-Dry-Run/Play-Test-Struktur
- Discord-Routing
- DB-basierte Settings
- JSON-Fallback
- Loudness-/Level-Korrektur
- Overlay-Client-ACKs

## Modulstand

- Backend-Datei: `backend/modules/sound_system.js`
- Modulname: `sound_system`
- Registry-Key: `sound_system`
- Modulversion: `0.1.21`
- Build: `diagnostics-standard`
- Runtime-Version: `0.1.12`
- Schema-Version: `1`
- Hauptprefix: `/api/sound`

## Diagnose-Status CAN-43.10

CAN-43.10 hat das Modul nach dem neuen Diagnose-/Registry-Standard geprüft.

Ergebnis:

- Statusroute vorhanden.
- `diagnostics`-Block vorhanden.
- Current-/Queue-Routen vorhanden.
- Routenübersicht vorhanden.
- Integration-Check vorhanden.
- EventBus-Status vorhanden.
- Sound-Command-Status vorhanden.
- Registry-Coverage sauber.
- Live-Status sauber.
- Kein aktueller Sound.
- Queue leer.
- Overlay-Client verbunden.
- Keine Codeänderung nötig.

## Wichtige Read-only Routen

- `GET /api/sound/status`
- `GET /api/sound/current`
- `GET /api/sound/queue`
- `GET /api/sound/list`
- `GET /api/sound/config`
- `GET /api/sound/settings`
- `GET /api/sound/routes`
- `GET /api/sound/integration-check`
- `GET /api/sound/eventbus/status`
- `GET /api/sound/eventbus/command/status`

## Produktive / testauslösende / schreibende Routen

Diese Routen sind produktiv oder können State verändern und wurden im CAN-43.10 Review nicht ausgelöst:

- `GET /api/sound/generated/beep.wav`
- `GET/POST /api/sound/play`
- `POST /api/sound/bundle`
- `POST /api/sound/stop`
- `POST /api/sound/skip`
- `POST /api/sound/clear`
- `POST /api/sound/pause`
- `POST /api/sound/resume`
- `POST /api/sound/reset`
- `POST /api/sound/settings`
- `POST /api/sound/reload`
- `GET/POST /api/sound/eventbus/test`
- `GET /api/sound/eventbus/reset`
- `GET/POST /api/sound/eventbus/command/test`
- `GET/POST /api/sound/eventbus/command/dry-run`
- `GET/POST /api/sound/eventbus/command/play-test`
- `GET /api/sound/eventbus/command/reset`
- Client-ACK-Routen unter `/api/sound/client/*`

## Bestätigte Live-Werte CAN-43.10

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

```text
diagnostics:
ok=True
health=ok
module=sound_system
version=0.1.21
build=diagnostics-standard
schemaVersion=1
schemaReady=True
lastError=
```

```text
counts:
current=0
parallel=0
queued=0
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
soundBusEmitted=2
soundBusErrors=0
soundBusCommandEmitted=0
soundBusCommandConsumed=0
soundBusCommandErrors=0
```

```text
database:
ok=True
adapter=sqlite
path=D:\Streaming\stramAssets\data\sqlite\app.sqlite
schemaVersion=1
expectedSchemaVersion=1
table=sound_settings
error=
```

```text
integration-check:
ok=True
healthy=True
warning=legacy_targets_and_output_targets_both_present
errors leer
```

## Bekannte Warnung

```text
legacy_targets_and_output_targets_both_present
```

Bewertung:

- Kein Fehler.
- `output.targets` ist das aktive Output-Modell für overlay/device/both.
- `targets` bleibt bewusst für Legacy-Kompatibilität stream/discord/both erhalten.
- Nicht entfernen, bis alle Caller migriert sind.

## Hinweise

- Die produktive SQLite-Datenbank bleibt `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- Keine Funktionalität entfernen.
- Produktive Play-/Bundle-/Reset-/EventBus-Test-/Dry-Run-/Client-ACK-Routen nur bewusst und gezielt testen.
- Doku/project-state bei Änderungen aktualisieren.
