# Loyalty Giveaways – LWG-4M.3

## Änderung
`/close` und `/close-entries` senden die Close-Meldung jetzt über den bestehenden Twitch Presence Chat-Ausgabeweg.

## Technische Umsetzung
Neuer interner Helper:
- `sendTwitchPresenceChatMessage(message, options)`

Nutzt:
- `require("./twitch_presence").sendChatMessage(...)`

Keine neue Twitch-Implementierung, keine neue Bot-Verbindung.

## Diagnose-Antwort
Bei Close:
```json
{
  "chatDispatchAttempted": true,
  "chatSent": true,
  "chatDispatch": { "ok": true }
}
```

Wenn Bot nicht verbunden:
```json
{
  "chatDispatchAttempted": true,
  "chatSent": false,
  "chatDispatch": { "ok": false, "error": "twitch_chat_not_connected" }
}
```

Das ist kein Fehler des Giveaway-Statuswechsels.
