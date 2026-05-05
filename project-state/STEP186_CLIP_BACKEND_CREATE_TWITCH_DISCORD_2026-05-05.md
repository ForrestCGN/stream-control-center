# STEP186 - Clip Backend Create: Twitch API, Discord und OBS-Save-Timing

Stand: 2026-05-05

## Ziel

Der Clip-Flow bekommt den ersten echten Backend-Create-Endpunkt. Streamer.bot muss fuer diesen Test noch nicht umgebaut werden; bestehende Routen und der bisherige ClipV2-Ablauf bleiben erhalten.

## Betroffene Dateien

- `backend/modules/clips.js`
- `backend/modules/twitch.js`

## Neue/erweiterte Routen

- `GET /api/clip/create`
- `POST /api/clip/create`
- `GET /api/clip/job/:jobId`

Bestehende Routen bleiben erhalten:

- `GET /api/clip/status`
- `GET /api/clip/title`
- `GET/POST /api/clip/register`
- `GET /api/clip/history`
- `GET /api/twitch/auth/validate`

## Twitch-Erweiterung

`backend/modules/twitch.js` stellt intern/exportiert jetzt bereit:

- `createClipForBroadcaster(broadcasterId, options)`
- `getClipById(clipId)`

Diese Funktionen nutzen die vorhandene OAuth-/Helix-Struktur und keinen neuen Twitch-Client.

## Clip-Create Ablauf

`/api/clip/create` macht in STEP186:

1. Settings ueber `clip_settings`/Helper laden.
2. Texte ueber `module_text_variants`/Helper laden.
3. Readiness pruefen:
   - Clip-System aktiv
   - Backend-Create aktiv
   - Twitch-Token vorhanden
   - `clips:edit` vorhanden
   - OBS Replay Buffer bereit
   - Discord-Ziel bereit
4. Clip-Titel bauen.
5. Twitch-Clip per Twitch API erstellen.
6. `jobId` erzeugen.
7. Clip-History anlegen.
8. Sofort eine Antwort mit `jobId`, Twitch-Clip-ID/Edit-URL und Chat-Starttext zurueckgeben.
9. Im Hintergrund:
   - Twitch-Clip pollend abrufen.
   - Discord-Post aus zufaelliger DB-Textvariante senden.
   - OBS ReplayBufferSave nach `obsReplaySaveDelayMs` ausloesen.
   - History aktualisieren.

## OBS-Zeitregel

Fachliche Regel bleibt:

- Lokaler OBS-Clip: 60 Sekunden
- 30 Sekunden vor `!clip`
- 30 Sekunden nach `!clip`

Technisch:

- `!clip` bei T+0
- Twitch-Clip sofort
- OBS `SaveReplayBuffer` bei T+30s (`obsReplaySaveDelayMs = 30000`)

Das lokale Datei-Suchen und Umbenennen ist noch nicht Bestandteil von STEP186. Das folgt in STEP187.

## Datenbank

`clip_history` wird sanft erweitert, ohne bestehende Daten zu loeschen:

- `job_id`
- `twitch_edit_url`
- `twitch_status`
- `obs_replay_requested`
- `obs_replay_saved`
- `obs_replay_error`
- `obs_replay_requested_at`
- `updated_at`

SQLite-Dateien werden nicht ersetzt oder committed.

## Bewusst offen

- Lokale OBS-Datei suchen, Sperrpruefung, Umbenennen und Pfad speichern.
- Streamer.bot-Action reduzieren.
- Dashboard-Modul fuer Clip-History/Settings/Texte.
- Doku-Sync der zentralen Projektdateien nach erfolgreichem Live-Test.

## Tests nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/status" | ConvertTo-Json -Depth 30
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=!clip%20BackendTest&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
```

Direkt danach:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=5" | ConvertTo-Json -Depth 30
```

Nach ca. 35 Sekunden:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=5" | ConvertTo-Json -Depth 30
```

Optional mit Job-ID:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/job/<jobId>" | ConvertTo-Json -Depth 30
```
