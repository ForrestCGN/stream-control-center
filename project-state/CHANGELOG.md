# CHANGELOG

## STEP448 – VIP Bus-First kontrollierter Produktiv-Test

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.30` angehoben.
- VIP-Feature auf `vip_bus_first_productive_test` gesetzt.
- `backend/modules/sound_system.js` auf Version `0.1.20` angehoben.
- Sound-Command-Layer auf `sound_bus_command_productive_play_layer` erweitert.
- Neue produktive Sound-System-Route ergänzt:
  - `GET /api/sound/eventbus/command/play`
  - `POST /api/sound/eventbus/command/play`
- VIP-Produktivpfad nutzt jetzt kontrolliert den Sound-Bus:
  - `effectiveVipFlow: sound_bus_command`
  - `effectiveSoundEntryPoint: sound_bus_command`
  - `normalChatCommandUsesBusFirst: true`
  - `productiveEntryPointChanged: true`
- Legacy `/api/sound/play` bleibt als Fallback erhalten, falls der produktive Bus-Pfad nicht spielt oder queued.
- Status-/Diagnosefelder für produktiven Bus ergänzt:
  - `productiveBusFirstActive`
  - `productiveBusUsed`
  - `lastProductiveBusError`
  - `productivePlayChecks`
  - `productivePlayOk`
  - `productivePlayFailed`
  - `lastProductivePlay`
- Keine DB-Migration.
- Kein Dashboard-Umbau.
- Bestehende Admin-/DryRun-/PlayTest-Pfade bleiben für Debugging erhalten, werden aber nicht weiter ausgebaut.
