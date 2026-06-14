# CURRENT CHAT HANDOFF - CAN44.36 AutoShoutout Stream Bus Consumer

## Stand

CAN44.35 hat `twitch_events` als zentrale Stream-State-Verteilstelle bestaetigt. Online/Offline wird ueber `twitch.stream.online` und `twitch.stream.offline` ueber den Communication Bus gesendet, ohne EventSub-Abo.

CAN44.36 macht `clip_shoutout` / AutoShoutout zum ersten echten Consumer dieser Events.

## Geaendert

- `backend/modules/clip_shoutout.js`
- Version `0.2.48`
- Neuer Bus-Subscriber `clip_shoutout:twitch.stream:auto_shoutout`
- Status sichtbar unter:
  - `/api/clip-shoutout/status` -> `autoShoutout.state.streamBusSubscriber`
  - `/api/clip-shoutout/status` -> `autoShoutout.state.streamState`

## Nicht geaendert

- Keine Funktionalitaet entfernt.
- Chat-Consumer fuer `twitch.chat.message` bleibt unveraendert.
- AutoShoutout-Triggerlogik bleibt unveraendert.
- `twitch_events` bleibt Besitzer der Twitch-Stream-Bus-Events.

## Naechster Test

Manual Override in `twitch_events` ausloesen und dann `clip_shoutout/status` pruefen.

## StepDone

`.\stepdone.cmd "CAN44.36 AutoShoutout Stream Bus Consumer"`
