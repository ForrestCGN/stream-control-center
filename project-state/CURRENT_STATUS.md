# CURRENT STATUS – STEP452

Aktueller Stand: **STEP452 – VIP Command Bus Productive Integration**.

Der VIP-Sound-Command läuft nun produktiv über das vorhandene Node-Command-System und den Sound-Bus. Streamer.bot ist für `!vip` entfernt.

Bestätigt:

```text
productiveVipFlow: sound_bus_command
normalChatCommandUsesBusFirst: True
productiveSwitchEffectiveEnabled: True
productiveSwitchSafetyLocked: False
productiveEntryPointChanged: True
legacyVipFlow: fallback_only
```

Zusätzlich wurde bestätigt:

```text
productivePlayChecks: 2
productivePlayOk: 2
productivePlayFailed: 0
lastSoundId: vip/adoredpenny.mp3
lastProductiveBusError: leer
```

`commands.js` enthält ab STEP452 den VIP-Sound-Catalog-Eintrag und einen Default-Seed für `vip`.
