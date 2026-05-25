# CURRENT_SYSTEM_STATUS – STEP407 VIP EventBus Smoke-Test

Stand: STEP407 vorbereitet.

Das VIP-/Mod-Sound-System bleibt produktiv Sound-System-geführt. Der EventBus wird zusätzlich als Status-/Diagnosekanal genutzt.

Neue Smoke-Test-Routen:

```text
/api/vip-sound/eventbus/test
/api/vip-sound-overlay/eventbus/test
```

Diese Routen senden ein `vip.sound` Test-Event, ohne Sound, Overlay, Queue oder Daily-Usage zu verändern.
