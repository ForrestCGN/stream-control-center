# STEP187 - Clip Local Replay File Handling

Stand: 2026-05-05

## Ziel

Das Clip-System verarbeitet lokale OBS-Replay-Dateien jetzt backendseitig weiter. Die bisherige Streamer.bot-/C#-Logik zum Finden, Freipruefen und Umbenennen der Replay-Datei wurde in `backend/modules/clips.js` integriert.

## Betroffene Dateien

- `backend/modules/clips.js`

## Aenderungen

- `clip_history` wurde sanft auf Schema-Version 3 erweitert.
- Neue optionale History-Felder:
  - `local_replay_saved`
  - `local_replay_path`
  - `local_replay_file`
  - `local_replay_error`
  - `local_replay_renamed_at`
- Nach `SaveReplayBuffer` wartet das Backend `localReplayRenameDelayMs`.
- Danach wird im konfigurierten `localReplayDir` die neueste Datei innerhalb von `localReplayLookbackMinutes` gesucht.
- Die Datei wird bis zu 5 Sekunden auf Les-/Schreibbereitschaft geprueft.
- Danach wird die Datei nach folgendem Muster umbenannt:
  - `Clip_yyyy-MM-dd_HH-mm-ss-TriggerUser-CustomTitle.ext`
- Ungueltige Dateizeichen werden ersetzt.
- Bestehende Dateien werden nicht ueberschrieben; bei Namenskollision wird `_1`, `_2`, ... angehaengt.
- Discord-Post erfolgt im Backend-Job nach OBS-/Local-Replay-Verarbeitung, damit Platzhalter wie `{localReplayFile}` und `{localReplayPath}` verfuegbar sind.

## Bewusst unveraendert

- Keine Streamer.bot-Action wurde geaendert.
- `/api/clip/title`, `/api/clip/register`, `/api/clip/history` bleiben erhalten.
- Twitch Create Clip wird weiterhin nur live getestet; offline greift der Guard aus STEP186.2.
- SQLite-Datei wird nicht ersetzt oder neu gebaut.

## Tests

Nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=5" | ConvertTo-Json -Depth 30
```

Schema-Erwartung:

- `schemaVersion = 3`
- History-Ausgabe enthaelt lokale Replay-Felder.

Live-End-to-End-Test erst sinnvoll, wenn Twitch live ist und OBS Replay Buffer aktiv ist.
