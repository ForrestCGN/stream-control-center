# STEP186.2 - Clip Create Offline Guard

Stand: 2026-05-05

## Ziel

`/api/clip/create` soll offline nicht mehr blind den Twitch-Create-Clip-Endpunkt aufrufen. Twitch erstellt Clips nur bei aktivem Stream; offline fuehrt der API-Aufruf zu einem 404. Dieser STEP bricht vorher kontrolliert ab.

## Betroffene Dateien

- `backend/modules/clips.js`

## Änderungen

- Neuer Text-Key `systemStreamNotLive` in den Clip-Textvarianten.
- `/api/clip/create` prueft `channelInfo.is_live === false`, bevor Twitch Create Clip aufgerufen wird.
- Offline-Fall wird sauber als `stream_not_live` zurueckgegeben.
- History wird mit `status = skipped`, `reason = stream_not_live` und `sourceMethod = backend_create_offline` geschrieben.
- Kein Twitch-Create-Call, wenn der Stream nicht live ist.
- Keine bestehende Route entfernt.
- Keine Streamer.bot-Action geaendert.

## Erwartete Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=!clip%20OfflineGuard&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=5" | ConvertTo-Json -Depth 30
```

Offline muss `/api/clip/create` mit `error = stream_not_live` abbrechen und einen History-Eintrag mit `status = skipped` erzeugen.

## Bewusst offen

- Echter Twitch-Create-Test erst im Live-Stream.
- Lokales OBS-Replay-Datei-Suchen und Umbenennen folgt in STEP187.
- Dashboard-Modul folgt spaeter.
