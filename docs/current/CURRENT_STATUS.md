# CURRENT STATUS – stream-control-center

Stand: 2026-06-10

## Aktueller bestätigter BUS-TWITCH-Stand

```text
STEP BUS-TWITCH.13 – Channelpoints/VIP30 Event-Mapping geprüft und dokumentiert
```

## Produktiver Chat-/Command-Standard

```text
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

Bestätigt aus BUS-TWITCH.10/BUS-TWITCH.9:

```text
- twitch_events EventSub Chat Autostart aktiv
- EventSub WebSocket OPEN, Keepalive vorhanden
- channel.chat.message Subscription enabled
- commands Bus-Subscriber autostart=true
- twitch_presence Command-Direktweg default deaktiviert
- Presence/IRC bleibt als Fallback vorhanden
```

## Channelpoints / VIP30 Prüfstand

BUS-TWITCH.13 ist ein reiner Analyse-/Planungsstand. Es wurden keine produktiven Channelpoints- oder VIP30-Flows geändert.

Erkannte Ist-Struktur:

```text
twitch.js
→ besitzt aktuell weiterhin produktive EventSub-Verbindung und Subscription channel.channel_points_custom_reward_redemption.add

channelpoints_eventsub_bus_bridge.js
→ pollt aktuell EventSub-Audit/Cache-Dateien
→ emittiert channelpoints.redemption / received auf den Communication Bus

channelpoints.js
→ besitzt lokales Reward-/Redemption-Modell
→ kann channelpoints.redemption / received empfangen
→ kann Fulfill/Cancel Policies und Twitch-Status-Updates ausführen

vip30.js
→ subscribed aktuell auf channelpoints.redemption / received
→ verarbeitet VIP30-Reward fachlich
→ besitzt Safety-/Live-Execution-Status und externe VIP-Remove-Subscriptions
```

Zielbild für spätere Migration:

```text
Twitch EventSub channel.channel_points_custom_reward_redemption.add
→ twitch_events
→ communication_bus: twitch.channelpoints.redemption.created
→ vip30 / channelpoints / weitere Module abonnieren gezielt
```

## Wichtige Abgrenzung

```text
Keine Funktionalität entfernen.
Keine produktive SQLite-Datei ersetzen.
Keine bestehende twitch.js-EventSub-Logik entfernen, bevor neue Subscriber erfolgreich getestet sind.
Keine Fulfill-/Cancel-/VIP-Grant-Logik umbauen, bevor Mapping und Testmodus bestätigt sind.
```
