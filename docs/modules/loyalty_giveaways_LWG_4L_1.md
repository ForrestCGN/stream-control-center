# Loyalty Giveaways - LWG-4L.1

## Zweck
Runtime-Bruecke fuer Chatcommands vorbereiten, ohne Commands aktiv zu schalten.

## Runtime
`handleChatCommandRuntime(input)` kennt:
- `ticket`
- `wheel`
- `rad`

Solange `CHAT_COMMANDS_ACTIVE=false` ist, werden alle drei bewusst blockiert und liefern einen deaktivierten Chattext.

## API
```http
POST /api/loyalty/giveaways/runtime/chat-command
POST /api/loyalty/giveaways/runtime/command
```

Beispiel:
```json
{
  "command": "ticket",
  "userLogin": "forrestcgn",
  "userDisplayName": "ForrestCGN"
}
```

Erwartete Antwort im aktuellen Step:
```json
{
  "ok": false,
  "active": false,
  "commandsActive": false,
  "error": "chat_commands_disabled"
}
```

## Sicherheit
- Keine Twitch-Command-Aktivierung.
- Keine Punktebuchung.
- Keine bestehende Funktionalitaet entfernt.
