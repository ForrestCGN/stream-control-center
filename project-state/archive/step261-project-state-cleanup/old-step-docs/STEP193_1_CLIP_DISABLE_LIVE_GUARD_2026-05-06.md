# STEP193.1 - Clip Backend Live-Guard entfernt

Stand: 2026-05-06

## Änderung

In `backend/modules/clips.js` wurde der Vorab-Block entfernt, der `/api/clip/create` bei `channelInfo.is_live === false` sofort mit `stream_not_live` abgebrochen hat.

## Grund

Twitch Helix `/streams` meldete während des Live-Tests weiterhin `data: []`, obwohl Forrest definitiv live war.

Dadurch konnte der neue Backend-Create-Flow nicht getestet werden.

## Neues Verhalten

`/api/clip/create` prüft weiterhin:

- Clip-System aktiv
- Backend-Create aktiv
- Twitch OAuth / clips:edit bereit
- OBS Replay bereit
- Discord bereit

Aber es blockiert nicht mehr nur wegen `channelInfo.is_live === false`.

Wenn Twitch wirklich keinen Clip erstellen kann, schlägt Twitch `Create Clip` selbst fehl und die History bekommt `failed` mit Fehlergrund.

## Nicht geändert

- Keine DB-Änderung
- Keine Dashboard-Änderung
- Keine Streamer.bot-Umstellung
- Alter `/api/clip/register`-Flow bleibt unverändert
- Alter Streamer.bot-`!clip`-Ablauf bleibt unangetastet

## Nach dem Deploy testen

```powershell
cd D:\Streaming\stramAssets

try {
  Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=LiveBackendTest&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
} catch {
  $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 30
}

Start-Sleep -Seconds 40
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=5" | ConvertTo-Json -Depth 30
```

## Erwartung

Bei funktionierendem Twitch-Create:

- Clip-ID/URL vorhanden
- History mit neuerem Eintrag
- OBS Replay wird nach Delay angefordert
- lokale Datei wird gesucht/umbenannt
- Discord-Post wird versucht/gesetzt

Wenn Twitch Create Clip ablehnt:

- History `failed`
- `reason` zeigt Twitch-/Backend-Fehler
- kein `stream_not_live`-Skip mehr vorab
