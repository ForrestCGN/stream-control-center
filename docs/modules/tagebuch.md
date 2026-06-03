# Tagebuch Modul

## Kurzbeschreibung

Das Modul `tagebuch` stellt das Streamtagebuch bereit.

Es verwaltet:

- Streamtagebuch-Seiten
- Streamstart-/Streamende-Status
- Tagebuch-Einträge
- Discord-Posting
- User-Statistiken
- DB-basierte Settings
- DB-basierte Textvarianten
- Legacy-Routen für bestehende Streamer.bot-/Discord-Integrationen

## Modulstand

- Backend-Datei: `backend/modules/tagebuch.js`
- Modulname: `tagebuch`
- Modulversion: `0.1.0`
- Schema-Version: `5`
- Kategorie: `content`
- Hauptprefix: `/api/tagebuch`
- Legacy-Prefixe: `/discord/tagebuch`, `/discord/stream`

## Diagnose-Status CAN-43.6

CAN-43.6 hat das Modul nach dem neuen Diagnose-/Registry-Standard geprüft.

Ergebnis:

- Statusroute vorhanden.
- `diagnostics`-Block vorhanden.
- Routenübersicht vorhanden.
- Integration-Check vorhanden.
- Registry-Coverage sauber.
- Live-Status sauber.
- Keine Codeänderung nötig.

## Wichtige Read-only Routen

- `GET /api/tagebuch/status`
- `GET /api/tagebuch/config`
- `GET /api/tagebuch/settings`
- `GET /api/tagebuch/routes`
- `GET /api/tagebuch/integration-check`
- `GET /api/tagebuch/stats`
- `GET /api/tagebuch/stats/top`
- `GET /api/tagebuch/stats/today`
- `GET /api/tagebuch/stats/user`

## Produktive Routen

Diese Routen sind produktiv und wurden im CAN-43.6 Review nicht ausgelöst:

- `GET/POST /api/tagebuch/stream/start`
- `GET/POST /api/tagebuch/stream/end`
- `GET/POST /api/tagebuch/entry`
- `GET/POST /api/tagebuch/reset`
- `GET/POST /api/tagebuch/reload`
- `POST /api/tagebuch/admin/settings`
- `POST /api/tagebuch/admin/texts`
- Legacy-Routen unter `/discord/tagebuch` und `/discord/stream`

## Bestätigte Live-Werte CAN-43.6

```text
ok=True
module=tagebuch
version=2
schemaVersion=5
databasePath=D:\Streaming\stramAssets\data\sqlite\app.sqlite
configPath=D:\Streaming\stramAssets\config\tagebuch.json
messagesPath=D:\Streaming\stramAssets\config\messages\tagebuch.json
```

```text
diagnostics:
ok=True
health=ok
module=tagebuch
version=0.1.0
schemaVersion=5
schemaReady=True
lastError=
```

```text
integration-check:
ok=True
healthy=True
schemaVersion=5
warnings leer
errors leer
```

## Aktueller State zum Review-Zeitpunkt

```text
activeStream=False
currentPageNumber=36
currentPageDate=2026-06-02
localDateToday=2026-06-03
hasEntriesForCurrentDate=True
endNoticePostedForCurrentDate=False
```

## Webhook

```text
useDiscordWebhook=True
hasWebhookUrl=True
webhookUrlEnv=DISCORD_WEBHOOK_TAGEBUCH
```

## Hinweise

- Die produktive SQLite-Datenbank bleibt `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- Keine Funktionalität entfernen.
- Produktive POST-/Lifecycle-/Entry-/Reset-/Reload-Routen nur bewusst und gezielt testen.
- Doku/project-state bei Änderungen aktualisieren.
