# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Nächster sinnvoller Schritt

```text
BUS-TWITCH.14 – Channelpoints Redemption Event aus twitch_events parallel emitten
```

Ziel:

```text
twitch_events soll channel.channel_points_custom_reward_redemption.add normalisieren und zusätzlich als neues Event publishen:

twitch.channelpoints.redemption.created
```

Wichtig:

```text
- bestehende channelpoints_eventsub_bus_bridge bleibt aktiv
- bestehende channelpoints.redemption / received Bridge bleibt aktiv
- vip30 bleibt zunächst auf altem Event subscribed
- keine Fulfill/Cancel-Änderung
- kein VIP-Grant-Umbau
- Dedupe vorbereiten, aber Altweg nicht entfernen
```

## Danach

```text
BUS-TWITCH.15 – VIP30 Subscriber für twitch.channelpoints.redemption.created vorbereiten
BUS-TWITCH.16 – Channelpoints/VIP30 Paralleltest mit Dedupe und Decision-Preview
BUS-TWITCH.17 – Alten Channelpoints-Bridge-Weg erst nach bestätigtem Produktivtest deaktivierbar machen
```
