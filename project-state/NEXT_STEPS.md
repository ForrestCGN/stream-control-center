# NEXT_STEPS

## Direkt nach STEP448

1. Syntax prüfen:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\vip_sound_overlay.js
node --check backend\modules\sound_system.js
```

2. Backend neu starten.

3. Status prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status"
$s | Select-Object version,feature,productiveVipFlow,normalChatCommandUsesBusFirst,productiveSwitchConfiguredEnabled,productiveSwitchEffectiveEnabled,productiveSwitchSafetyLocked,productiveEntryPointChanged,legacyVipFlow
$s.consolidatedBusFirstStatus | Select-Object profile,step,productivePath,normalChatCommandUsesBusFirst,productiveSwitchEffective,productiveSwitchSafetyLocked,productiveEntryPointChanged,legacyFallbackOnlyOnBusError
```

Erwartung:

- `version: 1.8.30`
- `feature: vip_bus_first_productive_test`
- `productiveVipFlow: sound_bus_command`
- `normalChatCommandUsesBusFirst: True`
- `productiveSwitchEffectiveEnabled: True`
- `productiveSwitchSafetyLocked: False`
- `productiveEntryPointChanged: True`
- `legacyVipFlow: fallback_only`

4. Produktiven VIP-Test auslösen.

Danach prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status"
$s.stats | Select-Object productivePlayChecks,productivePlayOk,productivePlayFailed,lastError,lastSoundId,lastProductiveBusError
$s.stats.lastProductivePlay | Select-Object ok,accepted,playedOrQueued,started,queued,normalizedSoundId,normalizedFile,queueTouched,audioTouched
```

Erwartung bei erfolgreichem Bus-Produktivtest:

- `productivePlayOk` steigt.
- `productivePlayFailed` bleibt `0`.
- `lastError` bleibt leer.
- `lastProductiveBusError` bleibt leer.
- `lastProductivePlay.playedOrQueued: True`.
- `lastProductivePlay.normalizedFile` zeigt z. B. `vip/adoredpenny.mp3`.

5. STEP448 abschließen:

```powershell
.\stepdone.cmd "STEP448 VIP Bus-First Productive Test"
```

## Danach möglich

Wenn der Produktivtest stabil läuft:

```text
STEP449 – VIP Bus-First Cleanup nach erfolgreichem Produktivtest
```

Ziel: Test-/Diagnoseballast reduzieren, ohne funktionierende Produktivlogik zu entfernen.
