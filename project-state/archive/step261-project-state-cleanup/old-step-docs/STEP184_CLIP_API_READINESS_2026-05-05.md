# STEP184 - Clip API Readiness

Stand: 2026-05-05

## Ziel

Dieser STEP bereitet den spaeteren Backend-Clip-Flow vor, ohne den bestehenden Streamer.bot-Clip-Ablauf zu entfernen oder zu veraendern.

Das Clip-System soll langfristig ueber Backend + Twitch-API + OBS-API laufen:

```text
!clip
-> Backend
-> Twitch Create Clip
-> OBS Replay Buffer Save nach 30 Sekunden
-> lokale Replay-Datei umbenennen
-> History in app.sqlite
-> Discord-Post
-> Chat-Antwort fuer Streamer.bot
```

## Fachliche Zeitregel

OBS soll lokale Clips als 60-Sekunden-Replay sichern:

```text
30 Sekunden vor !clip
30 Sekunden nach !clip
```

Daraus folgt:

```text
T+0s:  !clip / Twitch-Clip sofort erstellen
T+30s: OBS ReplayBufferSave ausloesen
```

Die aktuelle Readiness-Ausgabe dokumentiert diese Zielwerte:

- `targetReplayWindowSeconds = 60`
- `targetPreTriggerSeconds = 30`
- `targetPostTriggerSeconds = 30`
- `configuredPostTriggerDelayMs = obsReplaySaveDelayMs`

## Geaenderte Dateien

- `backend/modules/twitch.js`
- `backend/modules/clips.js`

## Neue Twitch-Diagnose

Neue Routen:

```text
GET /auth/validate
GET /twitch/auth/validate
GET /api/twitch/auth/validate
```

Die Route validiert den gespeicherten Twitch-User-Token ueber Twitch OAuth Validate und gibt ohne Secret-Ausgabe zurueck:

- Token vorhanden
- Login
- User-ID
- Broadcaster-ID
- ob Token-User und Broadcaster-ID zusammenpassen
- Scopes
- ob `clips:edit` vorhanden ist
- Restlaufzeit

Wichtige Rueckgabefelder:

```text
hasClipsEdit
tokenUserMatchesBroadcaster
expiresIn
scopes
```

## Clip-Status erweitert

`GET /api/clip/status` enthaelt jetzt zusaetzlich:

```text
twitchApi
obsReplay
discord
backendCreate
```

### twitchApi

Zeigt, ob der gespeicherte User-Token fuer Twitch Create Clip bereit ist:

- `tokenPresent`
- `login`
- `userId`
- `broadcasterId`
- `tokenUserMatchesBroadcaster`
- `hasClipsEdit`
- `readyForCreateClip`
- `blockers`

### obsReplay

Zeigt, ob OBS Replay backendseitig bereit ist:

- `bridgeAvailable`
- `replayBufferActive`
- `readyForBackendSave`
- Zielzeitwerte fuer 60s Replay
- `blockers`

### discord

Zeigt, ob der spaetere Discord-Post bereit ist:

- `discordPostEnabled`
- `discordChannelKey`
- `discordChannelConfigured`
- `bridgeAvailable`
- `readyForPost`
- `blockers`

### backendCreate

Fasst zusammen, ob der spaetere Backend-Flow grundsaetzlich startklar waere:

- `ready`
- `twitchCreateReady`
- `obsReplayReady`
- `discordReady`
- `blockers`

## Bewusst nicht geaendert

- Keine Streamer.bot-Action geaendert.
- Kein bestehender `/api/clip/title` Ablauf entfernt.
- Kein bestehender `/api/clip/register` Ablauf entfernt.
- Keine Twitch-Clip-Erstellung im Backend aktiviert.
- Keine OBS-Speicherlogik in den Clip-Flow eingebaut.
- Keine SQLite-Datei angefasst oder ersetzt.
- Keine Secrets ausgegeben oder committed.

## Helper-/Architekturregel

Der weitere Clip-Umbau soll vorhandene Strukturen nutzen:

- `helper_config` fuer JSON-Fallbacks und Config-Pfade
- `helper_settings` fuer dashboardfaehige Settings
- `helper_texts` fuer DB-Textvarianten
- `helper_messages` fuer Platzhalter/Message-Helfer
- `core/database` fuer DB-Zugriff
- `discordBridge` fuer Discord-Posts
- `obs_shared` fuer OBS Replay Buffer
- vorhandene Twitch/OAuth/Helix-Struktur in `twitch.js`

Keine neue Parallelstruktur fuer Twitch, OBS, Discord, Texte oder Settings.

## Tests nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/auth/validate" | ConvertTo-Json -Depth 20
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/obs/replay/status" | ConvertTo-Json -Depth 10
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/status" | ConvertTo-Json -Depth 30
```

Erwartung:

- `hasClipsEdit = true`
- `tokenUserMatchesBroadcaster = true`
- `obsReplay.replayBufferActive = true`
- `discord.readyForPost = true`, wenn Discord-Post aktiviert ist
- `backendCreate.ready = true`, wenn alle Voraussetzungen erfuellt sind

## Naechster sinnvoller STEP

Wenn STEP184 live gruen ist:

```text
STEP185 - Clip DB-Settings und DB-Textvarianten sauber aufbauen
```

Danach:

```text
STEP186 - /api/clip/create als Backend-Job vorbereiten
```
