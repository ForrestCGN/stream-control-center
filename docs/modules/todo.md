# Todo Modul

## Kurzbeschreibung

Das Modul `todo` stellt eine Todo-API mit Discord-Posting bereit.

Es verwaltet:

- Todo-Einträge für konfigurierte Zielpersonen
- Discord-Channel-Zuordnung
- User-/Tagesstatistiken
- DB-basierte Settings
- DB-basierte Textvarianten
- Legacy-Routen für bestehende Discord-/Streamer.bot-Integrationen

## Modulstand

- Backend-Datei: `backend/modules/todo.js`
- Modulname: `todo`
- Modulversion: `0.1.0`
- Schema-Version: `1`
- Kategorie: `content`
- Hauptprefix: `/api/todo`
- Legacy-Prefix: `/discord/todo`

## Diagnose-Status CAN-43.7

CAN-43.7 hat das Modul nach dem neuen Diagnose-/Registry-Standard geprüft.

Ergebnis:

- Statusroute vorhanden.
- `diagnostics`-Block vorhanden.
- Routenübersicht vorhanden.
- Integration-Check vorhanden.
- Registry-Coverage sauber.
- Live-Status sauber.
- 4/4 Channels konfiguriert.
- Keine Codeänderung nötig.

## Wichtige Read-only Routen

- `GET /api/todo/status`
- `GET /api/todo/config`
- `GET /api/todo/settings`
- `GET /api/todo/routes`
- `GET /api/todo/integration-check`
- `GET /api/todo/stats`
- `GET /api/todo/stats/top`
- `GET /api/todo/stats/today`

## Produktive Routen

Diese Routen sind produktiv und wurden im CAN-43.7 Review nicht ausgelöst:

- `GET/POST /api/todo/add`
- `GET/POST /api/todo/reload`
- `POST /api/todo/admin/settings`
- `POST /api/todo/admin/texts`
- `GET/POST /discord/todo`

## Bestätigte Live-Werte CAN-43.7

```text
ok=True
module=todo
version=2
schemaVersion=1
schemaReady=True
databasePath=D:\Streaming\stramAssets\data\sqlite\app.sqlite
discordChannelsPath=D:\Streaming\stramAssets\config\discord_channels.json
messagesPath=D:\Streaming\stramAssets\config\messages\todo.json
```

```text
diagnostics:
ok=True
health=ok
module=todo
version=0.1.0
schemaVersion=1
schemaReady=True
lastError=
```

```text
counts:
targets=4
channelsConfigured=4
channelsTotal=4
missingChannels=0
userStats=10
dailyStats=27
settings=5
textVariants=13
legacyTexts=13
```

```text
integration-check:
ok=True
healthy=True
schemaVersion=1
warnings leer
errors leer
```

## Targets

Aktuell bestätigt:

- `forrest`
- `engel`
- `roxxy`
- `gecko`

## Hinweise

- Die produktive SQLite-Datenbank bleibt `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- Keine Funktionalität entfernen.
- Produktive Add-/Reload-/Admin-Routen nur bewusst und gezielt testen.
- Doku/project-state bei Änderungen aktualisieren.
