# STEP193.3 - Clip Replay-Dateisuche nutzt nur OBS-Replay-Dateien

Stand: 2026-05-06

## Ausgangslage

Backend-Create funktioniert:

- Twitch-Clip erstellt
- Discord-Post erfolgreich
- OBS Replay Save erfolgreich
- History erfolgreich

Der lokale Rename schlägt fehl, weil das Backend die laufende OBS-Aufnahmedatei nimmt:

```text
d:\Aufnahme\Clips\2026-05-06 18-14-05.mp4
```

Diese Datei ist gesperrt und gehört offenbar zur laufenden Aufnahme.

Forrest hat bestätigt, dass Replay-Dateien so heißen:

```text
Replay 2026-05-06 19-02-19.mp4
```

## Änderung

`backend/modules/clips.js` wurde angepasst:

- Lokale Replay-Dateisuche berücksichtigt nur noch Dateien mit Prefix `Replay `.
- Normale Aufnahmedateien ohne Prefix werden ignoriert.
- Bereits umbenannte `Clip-YYYY-MM-DD_...` Dateien werden ignoriert.
- Kandidaten müssen Video-Dateien sein.
- Kandidaten müssen zeitlich zum aktuellen SaveReplayBuffer-Vorgang passen.
- Gesperrte Dateien werden übersprungen.
- Bis zu 20 Sekunden wird auf eine freie Replay-Datei gewartet.

## Wichtig zu Chat-Texten

Die Textlogik bleibt backend-/helperbasiert:

- Texte kommen aus `module_text_variants`.
- Streamer.bot soll später nur noch Trigger sein.
- Streamer.bot soll nicht selbst Textvarianten verwalten.
- Final muss das Backend oder ein zentraler Twitch-/Chat-Helper die Chatmeldung senden.

Aktuell liefert `/api/clip/create` noch `chatMessage` zurück. Das ist für Debug/Übergang okay, soll aber nicht die finale Textlogik in Streamer.bot erzwingen.

## Nicht geändert

- Keine DB-Änderung
- Keine Dashboard-Änderung
- Kein Streamer.bot-Umbau
- Alter `/api/clip/register` bleibt unverändert

## Test

Nach Deploy und Backend-Neustart:

```powershell
cd D:\Streaming\stramAssets

try {
  Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=LiveBackendTest4&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
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
- `localReplayFile` beginnt mit `Clip-...`
- `localReplayError = ""`
