# STEP448 – VIP Bus-First kontrollierter Produktiv-Test

## Ziel

Der normale VIP-Sound-Flow wird kontrolliert produktiv über den Sound-Bus geführt.

```text
VIP-Auslösung
→ VIP-Modul
→ sound_bus_command
→ Sound-System productive play route
→ Sound startet oder wird gequeued
```

## Versionen

- `backend/modules/vip_sound_overlay.js`: `1.8.30`
- `backend/modules/sound_system.js`: `0.1.20`
- VIP-Feature: `vip_bus_first_productive_test`
- Sound-Feature: `sound_bus_command_productive_play_layer`

## Neue produktive Sound-System-Route

```text
/api/sound/eventbus/command/play
```

Diese Route ist der produktive Bus-Consumer für command-förmige Sound-Payloads. Sie nutzt intern den normalen Sound-System-Flow und kann Audio starten oder in die Queue legen.

## Verhalten

- VIP nutzt Bus-First produktiv.
- Legacy `/api/sound/play` bleibt nur als Fallback bei Bus-Fehlern.
- DailyUsage wird nach erfolgreicher produktiver VIP-Auslösung normal geschrieben.
- Bestehende Admin-/DryRun-/PlayTest-Pfade bleiben erhalten.
- Keine DB-Migration.
- Kein Dashboard-Umbau.

## Erwarteter Status

```text
productiveVipFlow: sound_bus_command
normalChatCommandUsesBusFirst: true
productiveSwitchEffectiveEnabled: true
productiveSwitchSafetyLocked: false
productiveEntryPointChanged: true
legacyVipFlow: fallback_only
```

## Rollback

Bei Problemen kann auf den vorherigen STEP447-ZIP-Stand zurückgegangen werden. Legacy-Code wurde in STEP448 nicht entfernt.
