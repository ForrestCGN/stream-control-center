# VIP Overlay Event Shadow Test

Der aktuelle VIP-Flow bleibt:

```text
VIP API / Dashboard / Streamer.bot
→ /api/vip-sound
→ Sound-System
→ sound_system WebSocket + /api/sound/status
→ vip_sound_overlay_v2.html rendert Overlay
```

STEP401 ergänzt nur einen separaten Testpfad:

```text
/api/communication/test-vip-overlay
→ Communication-Bus channel vip.overlay action test
→ vip_sound_overlay_v2.html
→ bus_ack
```

Das Overlay verarbeitet `vip.overlay` in diesem STEP nur als Shadow/Debug/Ack. Es wird absichtlich keine sichtbare VIP-Anzeige über diesen Bus-Pfad gestartet.

Späterer möglicher STEP:

```text
STEP402/403: VIP overlay bus show/hide/update als echter paralleler Shadow-Renderer oder kontrollierter Produktivmodus
```
