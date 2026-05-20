# STEP239 - Message-Rotator Backend Direct Output

Stand: 2026-05-20

## Ziel

Der Message-Rotator soll Ausgaben ohne zusätzliche Streamer.bot-Sende-Logik direkt über das Backend senden können.

## Geändert

```text
backend/modules/message_rotator.js
htdocs/dashboard/modules/message_rotator.js
```

## Neue Konfiguration

```text
messageOptions.deliveryMode = backend | streamerbot | response_only
messageOptions.outputMode = chat | announcement
messageOptions.announcementColor = primary | blue | green | orange | purple
messageOptions.broadcasterId = optional, sonst TWITCH_BROADCASTER_ID
messageOptions.senderId = optional, sonst Bot-Token-Identität
messageOptions.moderatorId = optional, sonst Bot-Token-Identität
messageOptions.botLogin = optional, sonst TWITCH_BOT_USERNAME
```

## Verhalten

- `commit=0`: reine Vorschau, kein Senden.
- `deliveryMode=backend`: Backend sendet direkt über Twitch Helix.
- `deliveryMode=streamerbot`: API gibt weiterhin Streamer.bot-Handoff-Felder zurück.
- `deliveryMode=response_only`: keine direkte Ausgabe, nur API-Antwort/Testmodus.

## Twitch APIs

```text
chat         -> POST https://api.twitch.tv/helix/chat/messages
announcement -> POST https://api.twitch.tv/helix/chat/announcements
```

## Voraussetzungen

- `TWITCH_BROADCASTER_ID` muss gesetzt sein oder `messageOptions.broadcasterId`.
- Bot-Token muss gültig sein.
- Für Ankündigungen braucht der Bot die passende Twitch-Berechtigung und Moderatorrechte.

## Tests

```powershell
node --check backend\modules\message_rotator.js
node --check htdocs\dashboard\modules\message_rotator.js

Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/admin/settings" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/next?commit=0" | ConvertTo-Json -Depth 80
```

## Bewusst nicht geändert

```text
app.sqlite
config/**
backend/core/database.js
backend/modules/twitch.js
htdocs/dashboard/modules/message_rotator.css
```
