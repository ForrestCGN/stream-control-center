# STEP400 - VIP Overlay Bus Shadow Stable Handoff

## Purpose

Document the stable state after STEP399 successfully registered the VIP overlay as a Communication-Bus client in shadow mode.

## Confirmed user test output

```text
VipOverlayUrlStatus=200
VipStatus ok=True module= version=1.8.7
SoundStatus ok=True currentRequestId= queuedCount=0
CommunicationClients=alert_overlay_v2_shadow:alert_system:overlay:online,vip_sound_overlay_v2:vip_sound_overlay:overlay:online
VipBusClientOnline=True
CommunicationWatchdog issueCount=0
STEP399_STATUS=PASS
```

## Current productive VIP flow

```text
Streamer.bot / Dashboard / API
→ /api/vip-sound/command or /api/vip-sound/enqueue
→ vip_sound_overlay.js
→ /api/sound/play
→ sound_system
→ sound_system WebSocket + /api/sound/status
→ vip_sound_overlay_v2.html
→ overlay display
```

## Current Communication-Bus state

The VIP overlay is now visible as a bus client:

```text
clientId: vip_sound_overlay_v2
module: vip_sound_overlay
type: overlay
status: online
mode: shadow
```

## What this STEP does not do

- No production switch to `vip.overlay` events
- No replacement of Sound-System-driven VIP overlay display
- No change to VIP sound playback
- No Streamer.bot change
- No dashboard change

## Safe next step

STEP401 can introduce a shadow-only `vip.overlay` event test. The existing Sound-System display path must remain primary until shadow event delivery, ack/reconnect, and replay behavior are validated.
