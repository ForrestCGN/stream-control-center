# CURRENT STATUS – stream-control-center

Stand: 2026-06-10

## Aktueller bestätigter Zusatzstand

```text
STEP BUS-TWITCH.15 – VIP30 Twitch-Events Channelpoints Subscriber gebaut
```

## Bus-/Twitch-Stand

```text
Twitch EventSub Chat → twitch_events → communication_bus → commands ist Standard.
Channelpoints Redemption Created wird parallel als twitch.channelpoints.redemption.created auf den Bus gegeben.
VIP30 kann dieses neue Event jetzt manuell abonnieren; Altweg bleibt aktiv.
```

## Wichtig

```text
Keine Funktionalität entfernt.
VIP30-Altweg channelpoints.redemption/received bleibt aktiv.
Kein Fulfill/Cancel-/VIP-Grant-Umbau in diesem Step.
```
