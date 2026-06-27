# Current Chat Handoff – Loyalty LWG-4O.1

## Stand

STEP LWG-4O.1 fuehrt eine separate Shadow-Bruecke fuer Twitch-Chatnachrichten zum Communication Bus ein.

## Neue Datei

```text
backend/modules/twitch_chat_bus_bridge.js
```

## Verhalten

Der bestehende Chat-/Command-Ablauf bleibt erhalten:

```text
twitch_presence → commands.handleChatMessage(...)
```

Die neue Bridge umhuellt `commands.handleChatMessage(...)` und erzeugt bei PRIVMSG aus `twitch_presence` optional ein Bus-Event:

```text
channel: twitch.chat
action: message
```

Standardmaessig wird nur emitted, wenn ein passender Bus-Subscriber existiert:

```text
TWITCH_CHAT_BUS_ONLY_WHEN_SUBSCRIBED=true
```

## Wichtig fuer naechsten Step

Fuer Giveaway-Chat-Meldepflicht soll `loyalty_giveaways` spaeter gezielt auf `twitch.chat/message` subscriben. Sobald der Subscriber aktiv ist, kommen relevante Chatmessages durch den Bus.

## Status pruefen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/chat-bus/status" | ConvertTo-Json -Depth 10
```

## Syntax-Test

```powershell
node -c .\backend\modules\twitch_chat_bus_bridge.js
```

## StepDone

```powershell
.\stepdone.cmd "STEP LWG-4O.1 Twitch Chat Bus Bridge Shadow"
```
