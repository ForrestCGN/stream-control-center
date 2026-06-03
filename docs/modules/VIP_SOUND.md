# VIP Sound Modul

## Kurzbeschreibung

Das Modul `vip_sound_overlay` stellt das VIP-/Mod-Sound-System bereit.

Die echte Backend-Datei heißt:

```text
backend/modules/vip-sound.js
```

Das Modul verwaltet:

- VIP-/Mod-Sound Runtime
- Overlay-State
- Queue-State
- Client-ACKs
- Daily-Usage
- Texttemplates
- Settings
- Rollen-/Twitch-User-Daten
- Sound-Datei-Status und Uploads
- EventBus-/SoundBus-Vorbereitung

## Modulstand

- Backend-Datei: `backend/modules/vip-sound.js`
- Modulname: `vip_sound_overlay`
- Modulversion: `0.1.1`
- Build: `diagnostics-standard`
- Runtime-Version: `1.8.15`
- Schema-Version: `5`
- Registry-Key: `vip`
- Hauptprefix: `/api/vip-sound`
- Alias-Prefix: `/api/vip-sound-overlay`
- Absichtlich nicht registriert: `/api/vip`

## Diagnose-Status CAN-43.8

CAN-43.8 hat das Modul nach dem neuen Diagnose-/Registry-Standard geprüft.

Ergebnis:

- Statusroute vorhanden.
- `diagnostics`-Block vorhanden.
- Routenübersicht vorhanden.
- Integration-Check vorhanden.
- Registry-Coverage sauber.
- Live-Status sauber.
- Queue leer.
- Overlay nicht sichtbar.
- Kein aktiver Sound.
- Keine Codeänderung nötig.

## Wichtige Read-only Routen

- `GET /api/vip-sound/status`
- `GET /api/vip-sound/state`
- `GET /api/vip-sound/routes`
- `GET /api/vip-sound/integration-check`
- `GET /api/vip-sound/db/status`
- `GET /api/vip-sound/config`
- `GET /api/vip-sound/settings`
- `GET /api/vip-sound/events`
- `GET /api/vip-sound/events/recent`
- `GET /api/vip-sound/stats`
- `GET /api/vip-sound/daily-usage`
- `GET /api/vip-sound/daily-usage/today`
- `GET /api/vip-sound/sounds/users`
- `GET /api/vip-sound/sounds/status`
- `GET /api/vip-sound/sounds/resolve`
- `GET /api/vip-sound/twitch-sync/status`
- `GET /api/vip-sound/eventbus/status`
- `GET /api/vip-sound/eventbus/sound-command/status`

## Produktive / schreibende Routen

Diese Routen sind produktiv und wurden im CAN-43.8 Review nicht ausgelöst:

- `GET/POST /api/vip-sound/command`
- `GET/POST /api/vip-sound/enqueue`
- `POST /api/vip-sound/reset`
- `POST /api/vip-sound/settings/upsert`
- `POST /api/vip-sound/settings/delete`
- `POST /api/vip-sound/settings/reset-defaults`
- `POST /api/vip-sound/texts/upsert`
- `POST /api/vip-sound/texts/toggle`
- `POST /api/vip-sound/texts/delete`
- `POST /api/vip-sound/roles/upsert`
- `POST /api/vip-sound/roles/delete`
- `POST /api/vip-sound/roles/import-config`
- `POST /api/vip-sound/daily-usage/reset`
- `POST /api/vip-sound/daily-usage/reset-today`
- `POST /api/vip-sound/sounds/upload`
- `POST /api/vip-sound/twitch-sync/run`
- `POST /api/vip-sound/test`
- `POST /api/vip-sound/admin/test`
- `POST /api/vip-sound/admin/reset-daily`
- `POST /api/vip-sound/eventbus/test`
- `POST /api/vip-sound/eventbus/reset`
- `POST /api/vip-sound/eventbus/sound-command/test`
- `POST /api/vip-sound/eventbus/sound-command/dry-run`
- `POST /api/vip-sound/eventbus/sound-command/play-test`
- `POST /api/vip-sound/eventbus/sound-command/mode`
- `POST /api/vip-sound/eventbus/sound-command/reset`
- `POST /api/vip-sound/reload`
- Client-ACK-Routen unter `/client/*`

## Bestätigte Live-Werte CAN-43.8

```text
ok=True
module=vip_sound_overlay
moduleVersion=0.1.1
moduleBuild=diagnostics-standard
version=1.8.15
diagnosticVersion=0.1.1
canonicalPrefix=/api/vip-sound
prefix=/api/vip-sound
phase=idle
visible=False
isActive=False
queuedCount=0
routeCount=67
```

```text
diagnostics:
ok=True
health=ok
module=vip_sound_overlay
version=0.1.1
build=diagnostics-standard
runtimeVersion=1.8.15
schemaVersion=5
expectedSchemaVersion=5
schemaReady=True
lastError=
```

```text
database:
ok=True
adapter=sqlite
path=D:\Streaming\stramAssets\data\sqlite\app.sqlite
schemaVersion=5
expectedSchemaVersion=5
error=
```

```text
integration-check:
ok=True
summary total=15 ok=14 warnings=1 errors=0
```

Einzige Warnung:

```text
config_fallback=False warning file_not_found
note=JSON config is fallback only; database settings are primary.
```

## Hinweise

- Die produktive SQLite-Datenbank bleibt `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- DB-Settings sind primär.
- Die fehlende JSON-Fallback-Config wurde nur dokumentiert und nicht automatisch erstellt.
- Keine Funktionalität entfernen.
- Produktive Sound-/Upload-/Reset-/Sync-/EventBus-Test-Routen nur bewusst und gezielt testen.
- Doku/project-state bei Änderungen aktualisieren.
