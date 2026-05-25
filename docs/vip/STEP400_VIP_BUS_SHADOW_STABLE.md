# VIP Bus Shadow Stable State

## Summary

After STEP399, `vip_sound_overlay_v2.html` registers itself on the Communication-Bus while continuing to use the Sound-System as its active display source.

## Productive overlay URL

```text
http://127.0.0.1:8080/overlays/vip_sound_overlay_v2.html
```

## Current display trigger

The overlay still listens to:

- Sound-System WebSocket messages with `op = sound_system`
- `/api/sound/status` polling

VIP overlay display is filtered by:

```text
visual.module = vip_sound_overlay
```

## Shadow bus registration

Expected bus client:

```text
vip_sound_overlay_v2:vip_sound_overlay:overlay:online
```

## Intended future channel

Potential future event namespace:

```text
channel: vip.overlay
actions: show, hide, update, ack
```

This is not active production control yet.
