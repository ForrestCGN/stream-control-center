# CURRENT STATUS – stream-control-center

Stand: 2026-06-10

## Aktueller bestätigter Hauptstand

```text
STEP BUS-TWITCH.11 – Dokumentation/Konsolidierung nach BUS-TWITCH.1 bis BUS-TWITCH.10
```

## Bestätigter produktiver Standardweg für Chat/Commands

```text
Twitch EventSub channel.chat.message
→ backend/modules/twitch_events.js
→ communication_bus
→ backend/modules/commands.js
```

## Aktive/Bestätigte Modulstände

```text
twitch_events   0.1.6 / BUS_TWITCH_10_EVENTSUB_CHAT_AUTOSTART
commands        0.2.1 / BUS_TWITCH_9_COMMAND_SOURCE_DEFAULTS
twitch_presence 0.1.4 / BUS_TWITCH_9_COMMAND_SOURCE_DEFAULTS
twitch.js       0.1.3 / BUS_TWITCH_6_EVENTSUB_CHAT_ENABLE
```

## Bestätigte Live-Tests

```text
/api/twitch/events/status
→ ok=True, health=ok, twitch_events 0.1.6

/api/twitch/events/eventsub/chat/status
→ enabled=True
→ autostart=True
→ active=True
→ connecting=False
→ websocket.readyState=OPEN
→ subscription.type=channel.chat.message
→ subscription.status=enabled
→ lastError leer

/api/commands/bus-chat/status
→ enabled=True
→ active=True
→ autostart=True
→ subscriptionId=commands:twitch.chat:message

/api/twitch/presence/command-direct/status
→ enabled=False
→ mode=disabled
```

## Fallbacks bleiben vorhanden

```text
twitch_presence / IRC → commands.handleChatMessage(...)
```

Der Fallback ist nicht entfernt, aber default aus. Er kann per Route wieder aktiviert werden.

## Wichtige Regeln für weitere Migration

```text
Keine Funktionalität entfernen.
Erst parallel abonnieren und testen.
Erst danach alte Direktlogik deaktivieren oder entfernen.
Twitch-Events bleiben leichtgewichtig: kein ACK, kein Replay, keine Queue als Standard.
ACK/Replay sind vorbereitet, aber default aus.
Koordinierte Systemaktionen sollen später eigene Lifecycle-/Result-Events nutzen.
```
