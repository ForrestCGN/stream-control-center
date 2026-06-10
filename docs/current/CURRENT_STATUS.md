# CURRENT_STATUS – stream-control-center

Stand: 2026-06-10

## Aktueller bestätigter Hauptstand

```text
STEP BUS-TWITCH.16c – VIP30 Legacy Bridge Default Autostart Off bestätigt
```

## Communication-Bus / Twitch-Events

Der Communication-Bus ist als zentrale Modul-Kommunikations- und Monitoring-Schicht im Einsatz.

Bestätigte Twitch-Migrationen:

```text
BUS-TWITCH.1   twitch_events Foundation
BUS-TWITCH.2   Twitch Chat Parallel Bridge
BUS-TWITCH.3   EventSub Ownership Preparation
BUS-TWITCH.4   EventSub Chat Readiness
BUS-TWITCH.5   EventSub Chat Live Readiness
BUS-TWITCH.5b  OAuth Force Verify / user:read:chat Scope Diagnostics
BUS-TWITCH.6   Guarded EventSub Chat Enable
BUS-TWITCH.7   Commands Chat Bus Subscriber
BUS-TWITCH.8   Commands Source Switch
BUS-TWITCH.8b  Command Direct Route Fix
BUS-TWITCH.9   Command Source Defaults
BUS-TWITCH.10  EventSub Chat Autostart / Restart-Sicherheit
BUS-TWITCH.11  Dokumentation Konsolidierung
BUS-TWITCH.12  Modul-Migrationsplan
BUS-TWITCH.13  Channelpoints / VIP30 Event Mapping
BUS-TWITCH.14  Channelpoints Redemption Created Parallel Emit
BUS-TWITCH.14b Channelpoints Parallel Tap Reliability
BUS-TWITCH.15  VIP30 TwitchEvents Subscriber
BUS-TWITCH.15b VIP30 Payload Mapping Fix
BUS-TWITCH.16  VIP30 Source Switch / Autostart
BUS-TWITCH.16b VIP30 Legacy Bridge Hard Disable Gate
BUS-TWITCH.16c VIP30 Legacy Bridge Default Autostart Off
```

## Bestätigter aktueller Standardweg: Chat Commands

```text
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

`commands` nutzt den Bus-Chat-Subscriber als Standard. Der alte Presence-/IRC-Direktweg bleibt als Fallback vorhanden, ist aber standardmäßig aus.

## Bestätigter aktueller Standardweg: VIP30 Channelpoints

```text
Twitch EventSub channel.channel_points_custom_reward_redemption.add
→ twitch.js reliable parallel tap
→ twitch_events
→ communication_bus
→ vip30 TwitchEvents Subscriber
```

Bestätigter Status nach BUS-TWITCH.16c:

```text
twitchEvents.enabled=True
twitchEvents.active=True
twitchEvents.autostart=True
legacyBridge.enabled=True
legacyBridge.active=False
legacyBridge.autostart=False
legacyHardDisableGate=True
```

## VIP30-Teststand

Getestet mit Reward:

```text
30 Tage VIP
Reward-ID: 5932e698-9a57-4d13-9acc-c397682c10a6
Kosten: 35000
Testuser: forrestcgn
```

Ergebnis über den Bus-Weg:

```text
received=1
processed=1
ignored=0
duplicates=0
failed=0
lastResultReason=target_is_broadcaster
```

Das Ergebnis ist fachlich korrekt, weil der Broadcaster sich nicht sinnvoll selbst VIP geben kann.

## Legacy-Fallback

Der alte VIP30-Legacy-Weg bleibt vorhanden:

```text
POST /api/vip30/channelpoints/bridge/start
POST /api/vip30/channelpoints/bridge/stop
```

Er startet nach BUS-TWITCH.16c nicht mehr automatisch. Bei gestoppter Legacy-Bridge verhindert das Hard-Disable-Gate alte Verarbeitung.

## Wichtige Abgrenzung

```text
Keine produktive SQLite-Datei ersetzen.
Keine Fulfill-/Cancel-Regel entfernen.
Keine VIP30-Fachlogik entfernen.
Keine Legacy-Fallback-Funktionalität löschen.
Twitch-Events bleiben Input-Signale ohne ACK/Replay/Queue per Default.
```
