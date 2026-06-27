# CURRENT CHAT HANDOFF – BUS-TWITCH.13

Stand: 2026-06-10

## Bestätigter Stand

BUS-TWITCH.1 bis BUS-TWITCH.10 wurden live bestätigt. Chat/Commands laufen nun standardmäßig über:

```text
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

BUS-TWITCH.11/12 haben Doku und Migrationsplan konsolidiert.

BUS-TWITCH.13 hat Channelpoints/VIP30 analysiert und den nächsten Zielpfad festgelegt.

## Nächster Step

```text
BUS-TWITCH.14 – Channelpoints Redemption Created parallel über twitch_events emitten
```

## Leitplanken

```text
Keine Funktionalität entfernen.
Bestehenden Altweg nicht löschen.
VIP30 nicht produktiv umschalten, bevor neuer Eventweg getestet ist.
Fulfill/Cancel/VIP-Grant nicht anfassen.
```
