# Project State – CAN44.35 Twitch Events Stream State Provider

## Ziel

Twitch-Stream-Status wird zentral in `twitch_events` als abonnierbares Bus-Event bereitgestellt.

## Betroffene Module

- `backend/modules/twitch_events.js`
- `backend/modules/stream_status.js`
- `backend/modules/live_status_monitor.js`
- `htdocs/dashboard/modules/live_status_monitor.js`

## Versionen

- twitch_events 0.1.8 / CAN44.35_STREAM_STATE_PROVIDER
- stream_status 0.1.4 / CAN44.35_STREAM_STATE_SOURCE_ONLY
- live_status_monitor 0.1.5 / CAN44.34 monitor fix retained

## Events

- `twitch.stream.online`
- `twitch.stream.offline`

Quelle: `twitch_events` Stream-State-Provider. EventSub-Abo nicht erforderlich.

## Status

ZIP bereitgestellt. Live-Test steht aus.
