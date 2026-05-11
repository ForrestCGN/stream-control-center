# STEP193.2 - Clip Replay-Dateisuche überspringt gesperrte OBS-Dateien

Stand: 2026-05-06

## Ausgangslage

STEP193.1 hat den Vorab-Live-Guard entfernt. Danach war der Backend-Create-Test erfolgreich:

- Twitch-Clip erstellt
- Discord-Post erfolgreich
- OBS Replay Save erfolgreich
- History geschrieben

Fehler blieb beim lokalen Umbenennen:

```text
EBUSY: resource busy or locked, rename
d:\Aufnahme\Clips\2026-05-06 18-14-05.mp4
->
d:\Aufnahme\Clips\Clip-...
```

Die Datei `2026-05-06 18-14-05.mp4` war offenbar die laufende OBS-Aufnahme-Datei und nicht der frisch gespeicherte Replay-Clip.

## Änderung

`backend/modules/clips.js` wurde angepasst:

- Lokale Replay-Dateisuche nimmt nicht mehr stumpf die neueste Datei.
- Es werden nur Video-Dateien berücksichtigt.
- Bereits umbenannte `Clip-YYYY-MM-DD_...` Dateien werden übersprungen.
- Kandidaten werden nach Aktualität sortiert.
- Gesperrte Dateien werden übersprungen.
- Die Suche wartet bis zu 20 Sekunden auf eine freie Replay-Datei.
- Erst eine wirklich schreib-/umbenennbare Datei wird umbenannt.

## Nicht geändert

- Keine DB-Änderung
- Keine Dashboard-Änderung
- Kein Streamer.bot-Umbau
- Alter `/api/clip/register` bleibt unverändert
- Alter `!clip` bleibt unverändert

## Test

Nach Deploy und Backend-Neustart:

```powershell
cd D:\Streaming\stramAssets

try {
  Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=LiveBackendTest3&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
} catch {
  $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 30
}

Start-Sleep -Seconds 60
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=3" | ConvertTo-Json -Depth 30
```

Erwartung:

- `status = created`
- `discordPosted = true`
- `obsReplaySaved = true`
- `localReplaySaved = true`
- `localReplayPath` und `localReplayFile` gesetzt

Falls weiterhin false:

- OBS speichert Replay eventuell in denselben Dateinamen/Ordner wie laufende Aufnahme.
- Dann muss OBS Replay-Ausgabe oder Dateimuster genauer unterschieden werden.
