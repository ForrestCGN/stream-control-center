# CURRENT CHAT HANDOFF – BUS-TWITCH.14b

Stand: 2026-06-10

## Bestätigter Kontext

BUS-TWITCH.14 erzeugte `twitch.channelpoints.redemption.created` parallel zu bestehenden Channelpoints-/VIP30-Flows. Im Live-Test zeigte sich: Der alte Bridge-Weg sah 4 Redemptions, der neue Parallel-Tap aber nur 2. Damit erhielt der neue VIP30-Subscriber nicht jede Redemption.

## Fix BUS-TWITCH.14b

`twitch.js` wurde auf `0.1.5 / BUS_TWITCH_14B_CHANNELPOINTS_PARALLEL_RELIABILITY` erhöht.

Der Parallel-Tap nutzt jetzt mehrere sichere Quellen:

```text
EventSub Notification Handler
EventSub Cache Handler
EventSub Audit Handler
```

Zur Vermeidung von Doppel-Events wurde ein Redemption-ID-Dedupe ergänzt.

## Nicht geändert

```text
twitch_events.js
vip30.js
channelpoints_eventsub_bus_bridge.js
Fulfill / Cancel
DB / SQLite
produktive VIP30-Entscheidungslogik
```

## Nächster Test

1. Backend neu starten.
2. `stepdone.cmd` ausführen.
3. Channelpoints-Reward einlösen.
4. Parallel-Status prüfen.
5. Danach VIP30-Reward erneut testen.

