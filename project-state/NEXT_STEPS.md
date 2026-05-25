# NEXT STEPS

## Nach STEP450 testen

1. `node --check backend\modules\vip_sound_overlay.js`
2. `node --check backend\modules\sound_system.js`
3. Backend neu starten.
4. Direkten Backend-Test gegen `/api/vip-sound/command` wiederholen.
5. Danach echten Chat-Test `!vip @araglor` durchführen.

Wenn der direkte Backend-Test Sound startet und `productivePlayChecks` hochgeht, ist der produktive Bus-Hook technisch erreicht.
