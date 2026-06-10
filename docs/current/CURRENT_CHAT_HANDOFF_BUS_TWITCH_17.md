# CURRENT_CHAT_HANDOFF_BUS_TWITCH_17

Stand: 2026-06-10

## Kontext

Wir haben den Twitch-/Communication-Bus-Block bis BUS-TWITCH.16c abgeschlossen und dokumentieren ihn mit BUS-TWITCH.17.

## Wichtigste bestätigte Ergebnisse

### Chat Commands

```text
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

Commands laufen standardmäßig über den Bus. Presence-/IRC-Direktweg bleibt als Fallback, default aus.

### VIP30 Channelpoints

```text
Twitch EventSub channel.channel_points_custom_reward_redemption.add
→ twitch.js reliable parallel tap
→ twitch_events
→ communication_bus
→ vip30 TwitchEvents Subscriber
```

VIP30 läuft standardmäßig über den Bus.

Final bestätigter Status:

```text
twitchEvents.enabled=True
twitchEvents.active=True
twitchEvents.autostart=True
legacyBridge.enabled=True
legacyBridge.active=False
legacyBridge.autostart=False
legacyHardDisableGate=True
```

### VIP30 Legacy

Der alte Legacy-Weg bleibt manueller Fallback:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip30/channelpoints/bridge/start"
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip30/channelpoints/bridge/stop"
```

Nach Node-Neustart startet Legacy nicht mehr automatisch.

## Letzte relevante STEP-Kette

```text
BUS-TWITCH.14b Channelpoints Parallel Tap Reliability
BUS-TWITCH.15b VIP30 Payload Mapping Fix
BUS-TWITCH.16  VIP30 Source Switch / Autostart
BUS-TWITCH.16b VIP30 Legacy Bridge Hard Disable Gate
BUS-TWITCH.16c VIP30 Legacy Bridge Default Autostart Off
BUS-TWITCH.17  Dokumentation / Bus-Konsolidierung
```

## Nächster sinnvoller Schritt

```text
BUS-TWITCH.18 – Alerts Event Mapping / Migration Plan
```

Dabei zuerst analysieren, nicht direkt entfernen:

```text
- Follows
- Subs / Resubs
- Gift Subs / Sub Bombs
- Bits
- Raids
- Donations, falls im System vorhanden
```

## Arbeitsregeln weiter beachten

```text
Keine Funktionalität entfernen.
Alte Wege erst entfernen, wenn Ersatz produktiv getestet ist.
SQLite nicht ersetzen.
StepDone vor Live-Test.
ZIPs mit echten Zielpfaden liefern.
```
