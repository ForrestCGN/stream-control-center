# STEP195 - Backend Twitch Create Clip mit title/duration

Stand: 2026-05-06

## Ziel

Backend soll den Twitch-Clip-Titel direkt beim Create-Clip-Request übergeben.

Grund: Streamer.bot konnte über seine Sub-Action `Create Clip` offenbar `Clip Title = %clipTitle%` an Twitch übergeben. Der Backend-Flow soll ohne Streamer.bot denselben Weg testen.

## Geänderte Dateien

- `backend/modules/clips.js`
- `backend/modules/twitch.js`

## Änderung in `clips.js`

Der Backend-Create-Flow übergibt jetzt beim Twitch-Create:

```js
{
  hasDelay: false,
  title: title.clipTitle,
  duration: cfg.twitchClipDurationSeconds
}
```

## Änderung in `twitch.js`

`createClipForBroadcasterInternal()` hängt zusätzlich Query-Parameter an den Twitch-Request:

```text
title=<clipTitle>
duration=<5-60>
```

Zusammen mit:

```text
broadcaster_id=<id>
has_delay=false
```

## Bestehender erfolgreicher Flow bleibt erhalten

- Kein Streamer.bot für Twitch-Create
- Chat-Ausgaben über `twitch_presence`
- Texte über `helper_texts` / `module_text_variants`
- Discord-Post
- OBS Replay Save
- lokale Replay-Dateisuche nur mit Prefix `Replay `
- lokales Rename
- History
- Dashboard

## Test nach Deploy

```powershell
cd D:\Streaming\stramAssets

try {
  Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=BackendTitelTest&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
} catch {
  $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 30
}

Start-Sleep -Seconds 60
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=3" | ConvertTo-Json -Depth 30
```

Danach Twitch-Clip öffnen und prüfen, ob der sichtbare Twitch-Titel lautet:

```text
BackendTitelTest | Supermarket Together
```

## Bewertung

Wenn Twitch den Titel übernimmt:

- Backend kann Streamer.bot vollständig ersetzen.

Wenn Twitch den Titel ignoriert:

- Twitch-Create funktioniert weiter.
- History/Discord/localReplay bleiben korrekt.
- Sichtbarer Twitch-Titel bleibt Twitch-seitig Default/Streamtitel.
- Dann müssen wir entscheiden, ob ein weiterer API-/Editor-Weg existiert oder ob Twitch-Titel nicht zuverlässig backendseitig setzbar ist.
