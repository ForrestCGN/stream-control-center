# STEP: Message-Rotator per Streamer.bot Start/Stop steuern

Datum: 2026-05-10

## Ziel
Der Message-Rotator soll nicht mehr zusätzlich über den Twitch-Live-Check blockieren, sondern ausschließlich über Streamer.bot gestartet und gestoppt werden.

## Betroffene Datei
- `config/message_rotator.json`

## Änderung
- `runtime.onlyWhenLive` von `true` auf `false` gesetzt.
- `chat.botNames` unverändert beibehalten, inklusive `heimaufsichtcgn`.

## Bewusst nicht geändert
- Keine Backend-Codeänderung.
- Keine Routenänderung.
- Keine Cooldowns geändert.
- Keine Text-Keys geändert.
- Keine SQLite-/DB-Änderung.
- Keine Twitch-API-Änderung.

## Erwartetes Verhalten
- Streamer.bot Streamstart ruft `http://localhost:8080/api/message-rotator/start` auf.
- Streamer.bot Streamende ruft `http://localhost:8080/api/message-rotator/stop` auf.
- Der Rotator sendet nur, wenn `active=true` ist.
- Der Twitch-Live-Status `/api/twitch/stream?...` blockiert den Rotator nicht mehr.

## Minimaler Test nach Entpacken
```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/reload" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/start" | ConvertTo-Json -Depth 10
1..8 | ForEach-Object { Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/tick?user=testuser$_" | Out-Null }
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/next?commit=0" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/stop" | ConvertTo-Json -Depth 10
```

Hinweis: Direkt nach Start kann weiterhin `first_message_delay` kommen, weil `firstMessageDelayMinutes` unverändert auf 15 steht.
