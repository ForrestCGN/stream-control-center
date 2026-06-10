# twitch_events – Zentrale Twitch-Event-Schicht

Stand: 2026-06-10  
Version: 0.1.1  
Build: BUS_TWITCH_2_CHAT_PARALLEL

## Zweck

`twitch_events` stellt Twitch-Ereignisse zentral und abonnierbar ueber den Communication Bus bereit.
Das Modul enthaelt keine Fachlogik fuer Alerts, VIP30, Loyalty, Commands oder Sounds.

## BUS-TWITCH.2

In diesem Schritt wird Chat parallel angebunden:

```text
twitch_presence bleibt Chatquelle.
commands.handleChatMessage(...) bleibt aktiv.
twitch_presence ruft zusaetzlich twitch_events.handleIrcEvent(...) auf.
twitch_events emittet twitch.chat.message ueber den Communication Bus.
```

## Chat-Event Policy

```text
Event: twitch.chat.message
Channel: twitch.chat
Action: message
ACK: vorbereitet, default aus
Replay: vorbereitet, default aus
Queue: aus
TTL: 0
Priority: P2
Payload: minimal
Raw IRC: default aus
Tags: default aus
```

## Payload grob

```js
{
  eventKey: 'twitch.chat.message',
  category: 'chat',
  sourceModule: 'twitch_presence',
  receivedAt,
  normalizedAt,
  twitch: {
    source: 'irc',
    command: 'PRIVMSG',
    channel,
    message,
    messageLength,
    user: {
      login,
      displayName,
      userId,
      roles,
      badges
    }
  }
}
```

## Migrationsregel

```text
Keine Funktionalitaet entfernen.
Neue Twitch-Events laufen zuerst parallel.
Erst nachdem ein System erfolgreich ueber twitch_events abonniert, getestet und dokumentiert wurde,
darf alte Direktlogik in einem separaten Step entfernt oder deaktiviert werden.
```

## Statusrouten

```text
/api/twitch/events/status
/api/twitch/events/catalog
/api/twitch/presence/status
```

## Wichtige Tests

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,health,lastError

$p = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/status"
$p.chatBus

$b = Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
$b.status.clients | Where-Object { $_.module -eq "twitch_events" } |
  Select-Object id,module,type,status,lastHeartbeatAt,heartbeatCount
```

Nach einer echten Chatnachricht:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$s.diagnostics.counts.byEvent.'twitch.chat.message'

$p = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/status"
$p.chatBus | Select-Object emitCount,skippedCount,errorCount,lastResultReason,lastError
```

## Nicht geaendert

```text
twitch.js EventSub-Direktlogik bleibt aktiv.
commands Direktaufruf bleibt aktiv.
Alerts, Loyalty, VIP30, Sound-System und Overlays werden nicht umgestellt.
SQLite wird nicht geaendert.
twitch_chat_bus_bridge.js wird noch nicht entfernt.
```
