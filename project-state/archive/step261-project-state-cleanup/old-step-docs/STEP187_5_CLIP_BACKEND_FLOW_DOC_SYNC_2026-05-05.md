# STEP187.5 - Clip Backend Flow Doku-Sync

Stand: 2026-05-05

## Ziel

Zentrale Projekt-Dokus nach den Clip-Backend-Steps STEP183 bis STEP187 synchronisieren.

Dieser STEP ist ein reiner Doku-STEP.

Keine Codeaenderung.
Keine DB-Aenderung.
Keine Config-Aenderung.
Keine Dashboard-Aenderung.

## Hintergrund

Das Clip-System wurde in mehreren kleinen STEPs vom alten Streamer.bot-lastigen Ablauf in Richtung Backend-Flow umgebaut bzw. vorbereitet.

Wichtig: Der echte Live-End-to-End-Test ist noch offen, weil Twitch Create Clip offline erwartungsgemaess nicht erfolgreich laeuft.

## Dokumentierter Stand

### STEP183

- Clip-History in `app.sqlite` vorbereitet.
- `clip_history` eingefuehrt.
- Discord-Posting ueber vorhandene Discord-Bridge in `/api/clip/register` vorbereitet.
- Bestehende Routen erhalten:
  - `/api/clip/status`
  - `/api/clip/title`
  - `/api/clip/register`
- Neue Route:
  - `/api/clip/history`

### STEP184

- Twitch Token Validate eingefuehrt:
  - `/auth/validate`
  - `/twitch/auth/validate`
  - `/api/twitch/auth/validate`
- `clips:edit` wird geprueft.
- `/api/clip/status` zeigt Twitch-/OBS-/Discord-/Backend-Readiness.

### STEP185

- Clip-Settings ueber `helper_settings` vorbereitet.
- Settings-Tabelle:
  - `clip_settings`
- Clip-Texte ueber `helper_texts` vorbereitet.
- Texte liegen in:
  - `module_text_variants`
- JSON bleibt Seed/Fallback:
  - `config/clip_system.json`
  - `config/messages/clips.json`

### STEP185.5

- Discord-Zielkanal editierbar vorbereitet:
  - `discordChannelMode = key|custom`
  - `discordChannelKey`
  - `discordChannelId`
- Effektive Channel-ID und Quelle werden im Status gezeigt.
- Alte Kategorie `clip` in Textvarianten sanft auf neue Kategorien migriert.
- Aktuelle Kategorien:
  - `chat`
  - `discord`
  - `errors`
  - `system`

### STEP186

- Backend-Create-Route vorbereitet:
  - `GET/POST /api/clip/create`
- Job-Status-Route vorbereitet:
  - `GET /api/clip/job/:jobId`
- Twitch-Modul erweitert:
  - `createClipForBroadcaster(...)`
  - `getClipById(...)`
- Twitch-Create nutzt vorhandene OAuth-/Helix-Struktur in `twitch.js`.
- Kein neuer Twitch-Client.
- OBS-Save wird im Backend-Job nach 30 Sekunden geplant.
- Discord-Post laeuft ueber `discordBridge`.

### STEP186.1

- Schema-Migration fuer bestehende `clip_history` repariert.
- Fehler `no such column: job_id` behoben.
- Schema-Version: `2`.

### STEP186.2

- Offline-Guard eingefuehrt.
- Wenn `channelInfo.is_live = false`:
  - kein Twitch Create Clip
  - `error = stream_not_live`
  - History `status = skipped`
  - `sourceMethod = backend_create_offline`
- Live bestaetigt mit Offline-Test.

### STEP187

- Lokales Replay-Datei-Handling ins Backend uebernommen.
- `clip_history` auf Schema-Version `3` erweitert.
- Neue lokale Felder:
  - `localReplaySaved`
  - `localReplayPath`
  - `localReplayFile`
  - `localReplayError`
  - `localReplayRenamedAt`
- Backend sucht nach `SaveReplayBuffer` die neueste Datei im Clip-Ordner.
- Datei-Freigabe wird geprueft.
- Datei wird nach Muster umbenannt:
  - `Clip_yyyy-MM-dd_HH-mm-ss-TriggerUser-CustomTitle.ext`

## Aktuelle Fachregel Clip-Zeiten

Twitch:

```text
T+0s -> Twitch Create Clip sofort
Ziel: ca. 30 Sekunden Twitch-Clip
```

OBS lokal:

```text
T+0s  -> !clip empfangen
T+30s -> OBS SaveReplayBuffer
```

Dadurch ergibt sich bei 60 Sekunden OBS-Replay:

```text
30 Sekunden vor !clip
30 Sekunden nach !clip
```

Diese Regel ist verbindlich fuer das Clip-System.

## Aktueller Live-Test-Stand

Bestaetigt:

```text
/api/clip/status
schemaVersion = 3
database.ok = true
twitchApi.readyForCreateClip = true
obsReplay.readyForBackendSave = true
discord.readyForPost = true
backendCreate.ready = true
```

Bestaetigt:

```text
/api/clip/create offline
error = stream_not_live
history.saved = true
History:
status = skipped
reason = stream_not_live
sourceMethod = backend_create_offline
```

Offen:

```text
Echter Twitch Create Clip Live-Test waehrend aktivem Stream.
```

## Betroffene Doku-Dateien in diesem STEP

- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP187_5_CLIP_BACKEND_FLOW_DOC_SYNC_2026-05-05.md`

## Bewusst nicht geaendert

- Kein Backend-Code.
- Kein Dashboard-Code.
- Keine Config-Dateien.
- Keine SQLite-Datei.
- Keine Secrets.
- Keine Streamer.bot-Action.

## Naechster sinnvoller Schritt

Beim naechsten Live-Stream:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=!clip%20LiveTest&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
```

Nach ca. 35 Sekunden:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=5" | ConvertTo-Json -Depth 30
```

Danach, wenn der Flow sauber ist:

1. Streamer.bot-Action reduzieren.
2. Clip-Dashboard bauen.
