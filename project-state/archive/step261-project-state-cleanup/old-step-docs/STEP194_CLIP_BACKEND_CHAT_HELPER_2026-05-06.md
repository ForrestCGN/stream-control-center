# STEP194 - Clip Chat-Ausgabe backendseitig über twitch_presence/helper_texts

Stand: 2026-05-06

## Ziel

Streamer.bot soll später nur noch `/api/clip/create` triggern.

Clip-Texte sollen nicht in Streamer.bot gepflegt oder gesendet werden.

## Änderung

`backend/modules/clips.js` sendet Chatmeldungen jetzt backendseitig über:

- `backend/modules/twitch_presence.js`
- `twitchPresence.sendChatMessage(...)`

Die Textauswahl bleibt über:

- `helper_texts`
- `module_text_variants`
- Clip-Textkeys wie `chatClipActivated`, `chatClipCreated`, `chatClipFailed`

## Verhalten

Beim Start von `/api/clip/create`:

- Backend rendert `chatClipActivated`
- Backend sendet die Nachricht direkt über den Twitch-Bot/Presence-Helper
- Response enthält weiterhin `chatMessage`, `chatSent`, `chatResult` als Debug/Übergang

Nach erfolgreichem Twitch-Polling:

- Backend rendert `chatClipCreated` oder `chatClipCreatedWithoutUrl`
- Backend sendet die Ergebnisnachricht direkt über den Twitch-Bot/Presence-Helper

Bei Fehlern:

- Backend rendert passende Fehler-/Systemtexte
- Backend versucht diese ebenfalls direkt über den Presence-Helper zu senden

## Nicht geändert

- Keine DB-Änderung
- Keine Dashboard-Änderung
- Kein Streamer.bot-Umbau
- Alter `/api/clip/register` bleibt unverändert
- Replay-Prefix-Fix aus STEP193.3 bleibt enthalten
- Live-Guard-Entfernung aus STEP193.1 bleibt enthalten

## Voraussetzung

Twitch Presence muss verbunden sein:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/status" | ConvertTo-Json -Depth 30
```

Wichtig:

- `connected = true`
- `joined = true`

## Test

```powershell
cd D:\Streaming\stramAssets

try {
  Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=LiveBackendTest5&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
} catch {
  $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 30
}

Start-Sleep -Seconds 60
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=3" | ConvertTo-Json -Depth 30
```

Erwartung:

- Startmeldung erscheint im Twitch-Chat ohne Streamer.bot-Textversand.
- Ergebnisnachricht erscheint im Twitch-Chat ohne Streamer.bot-Textversand.
- `chatSent = true` in der Create-Response.
- Twitch/Discord/OBS/localReplay bleiben erfolgreich.
