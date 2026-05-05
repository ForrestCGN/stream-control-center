# STEP183 - Clip Backend Integration

Stand: 2026-05-05

## Ziel

Das vorhandene Clip-System wird in das zentrale Backend integriert, ohne bestehende Streamer.bot-Kompatibilitaet zu entfernen.

Dieser STEP ist bewusst klein gehalten:

- kein Dashboard-Umbau
- keine Aenderung am Streamer.bot-Ablauf
- keine neue Parallelstruktur
- keine SQLite-Datei im ZIP
- keine Secrets

## Betroffene Dateien

Geaendert:

- `backend/modules/clips.js`

Neu:

- `project-state/STEP183_CLIP_BACKEND_INTEGRATION_2026-05-05.md`

## Bestehende Routen bleiben erhalten

- `GET /api/clip/status`
- `GET /api/clip/title`
- `GET /api/clip/register`
- `POST /api/clip/register`

Neu ergaenzt:

- `GET /api/clip/history`

## Backend-Aenderungen

### Clip-Historie

`/api/clip/register` speichert erfolgreiche Register-Aufrufe jetzt in der zentralen `app.sqlite`.

Neue Tabelle, sanft per `CREATE TABLE IF NOT EXISTS`:

- `clip_history`

Spalten:

- `id`
- `clip_id`
- `clip_url`
- `clip_title`
- `custom_title`
- `stream_title`
- `game_name`
- `trigger_user`
- `status`
- `reason`
- `source_method`
- `discord_posted`
- `discord_error`
- `raw_payload_json`
- `created_at`

Schema-Version:

- Modul: `clips`
- Version: `1`

Wichtig:

- Es wird keine bestehende SQLite-Datei ersetzt.
- Es werden keine vorhandenen Daten geloescht.
- Schema wird nur erweitert.

### Discord-Posting

Wenn `config/clip_system.json` folgendes erlaubt:

```json
"discordPostEnabled": true
```

und in `config/discord_channels.json` der konfigurierte Channel-Key vorhanden ist, wird der Clip nach `/api/clip/register` ueber die vorhandene Discord-Bridge gepostet.

Genutzte Config-Werte:

- `discordPostEnabled`
- `discordChannelKey`
- `postOnlyWhenLive`
- `saveHistory`

Genutzter Discord-Mechanismus:

- `app.locals.discordBridge.postToChannel(...)`

Es wird kein neuer Discord-Client gebaut.

### Clip-Texte

Bestehende JSON-Texte aus:

- `config/messages/clips.json`

bleiben Fallback/Seed.

Der Clip-Code bereitet die Texte ueber den vorhandenen `helper_texts` fuer `module_text_variants` vor, sofern der Helper verfuegbar ist.

Modulname:

- `clips`

Text-Keys:

- `chatClipActivated`
- `chatClipCreated`
- `chatClipFailed`
- `chatClipCreatedWithoutUrl`
- `chatLocalReplayMissing`
- `chatLocalReplayInvalidDir`
- `chatReplaySaved`
- `discordClipPost`

Dashboard-Editor fuer Clip-Texte ist noch nicht Teil dieses STEPs.

## Bewusst unveraendert

- Streamer.bot kann weiterhin `/api/clip/title` und `/api/clip/register` nutzen.
- `config/clip_system.json` bleibt technische Config/Fallback.
- `config/messages/clips.json` bleibt Fallback/Seed.
- OBS Replay Buffer Ablauf bleibt unveraendert.
- Twitch Clip Erstellung bleibt weiterhin in Streamer.bot.
- Lokales Replay-Rename bleibt weiterhin in Streamer.bot.

## Tests nach Entpacken/Deploy

Syntaxcheck lokal:

```powershell
cd D:\Git\stream-control-center
node -c .\backend\modules\clips.js
```

Status nach Deploy/Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/status" | ConvertTo-Json -Depth 20
```

Titeltest:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/title?input=!clip%20Testclip" | ConvertTo-Json -Depth 20
```

Register-Test ohne echten Twitch-Clip:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/register?clipId=test-step183&clipUrl=https://clips.twitch.tv/test-step183&clipTitle=STEP183%20Test&triggerUser=ForrestCGN&gameName=Test" | ConvertTo-Json -Depth 20
```

History-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=5" | ConvertTo-Json -Depth 20
```

## Erwartung

`/api/clip/status` soll zeigen:

- `ok: true`
- `module: clips`
- `schemaVersion: 1`
- `database.ok: true`
- `database.table: clip_history`
- `discord.bridgeAvailable: true` oder zumindest nachvollziehbar `false`, falls Discord noch nicht geladen/ready ist

`/api/clip/register` soll zeigen:

- `ok: true`
- `registered: true`, wenn `saveHistory` aktiv ist
- `history.saved: true`
- `discord.posted: true` oder bei fehlender Bridge/Channel-Konfiguration einen klaren `reason`

## Offen / naechster Schritt

Naechster sinnvoller STEP:

- Clip-Dashboard-Modul planen:
  - Status
  - letzte Clips
  - Settings
  - Textvarianten
- Danach Clip-Texte im Dashboard editierbar machen.
- Optional spaeter: Streamer.bot Clip-C# final gegen die neuen Backend-Felder pruefen.
