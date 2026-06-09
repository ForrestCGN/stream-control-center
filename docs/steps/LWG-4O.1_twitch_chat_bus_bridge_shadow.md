# STEP LWG-4O.1 – Twitch Chat Bus Bridge Shadow

## Ziel

Dieser Step fuehrt eine sichere, leichte Chat-Event-Bruecke ein, ohne bestehende Command-Funktionalitaet zu entfernen.

Der vorhandene Ablauf bleibt bestehen:

```text
twitch_presence empfängt PRIVMSG
→ commands.handleChatMessage(...) wird weiterhin direkt ausgeführt
```

Zusaetzlich wird ein neuer Shadow-Bridge-Mechanismus eingefuehrt:

```text
twitch_presence → commands.handleChatMessage(...) Wrapper
→ optionales Bus-Event twitch.chat.message
```

## Neue Datei

```text
backend/modules/twitch_chat_bus_bridge.js
```

## Warum separate Datei?

Die aktuelle `backend/modules/twitch_presence.js` ist die produktive IRC-/Bot-Chatquelle. Um keine bestehende Funktionalitaet zu riskieren, wird sie in diesem Step nicht ersetzt oder umgebaut.

Stattdessen wird das bestehende `commands.handleChatMessage(...)` sicher umhuellt. Da `twitch_presence` PRIVMSG bereits dorthin weitergibt, kann die Bruecke Chatmessages erkennen und als Bus-Event bereitstellen.

## Bus-Lastschutz

Normale Chatmessages sind bewusst leichtgewichtig:

```text
channel: twitch.chat
action: message
replayable: false
requireAck: false
ttlMs: 0
priority: P2
target: backend module clients, nicht alle Overlays/Dashboards
```

Standardverhalten:

```text
TWITCH_CHAT_BUS_ONLY_WHEN_SUBSCRIBED=true
```

Das bedeutet: Wenn kein Modul auf `twitch.chat/message` subscribed, wird kein Bus-Event erzeugt. Commands laufen trotzdem weiter.

## Config per ENV

```text
TWITCH_CHAT_BUS_ENABLED=true|false
TWITCH_CHAT_BUS_ONLY_WHEN_SUBSCRIBED=true|false
TWITCH_CHAT_BUS_MAX_MESSAGE_LENGTH=450
TWITCH_CHAT_BUS_INCLUDE_BADGES=true|false
TWITCH_CHAT_BUS_INCLUDE_RAW=false|true
```

## Statusroute

```text
GET /api/twitch/chat-bus/status
GET /api/twitch/presence/chat-bus/status
```

## Keine Funktionsentfernung

Dieser Step entfernt keine Funktionalitaet:

- `twitch_presence` bleibt unveraendert.
- Command-Direktverarbeitung bleibt erhalten.
- Keine DB-Migration.
- Keine Streamer.bot-Abhaengigkeit.
- Kein EventSub-Chat-Umbau.
- Keine ACK-/Replay-Last fuer Chatmessages.

## Syntax-Test

```powershell
node -c .\backend\modules\twitch_chat_bus_bridge.js
```

## StepDone

```powershell
.\stepdone.cmd "STEP LWG-4O.1 Twitch Chat Bus Bridge Shadow"
```
