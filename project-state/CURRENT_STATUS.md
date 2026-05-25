# CURRENT_STATUS

Aktueller Stand: STEP448 – VIP Bus-First kontrollierter Produktiv-Test.

- VIP-Modul: `1.8.30`
- Sound-System: `0.1.20`
- VIP-Feature: `vip_bus_first_productive_test`
- Sound-Feature: `sound_bus_command_productive_play_layer`

STEP448 aktiviert den produktiven VIP-Bus-Pfad kontrolliert. Der normale VIP-Sound-Flow kann jetzt über `sound_bus_command` laufen. Das Sound-System stellt dafür die produktive Route `/api/sound/eventbus/command/play` bereit.

Wichtig:

- Normaler VIP-Flow ist jetzt Bus-First.
- `productiveVipFlow` soll `sound_bus_command` sein.
- `normalChatCommandUsesBusFirst` soll `true` sein.
- `productiveSwitchSafetyLocked` ist `false`.
- `productiveEntryPointChanged` ist `true`.
- Legacy `/api/sound/play` bleibt nur als Fallback bei Bus-Fehlern erhalten.
- Keine DB-Migration.
- Kein Dashboard-Umbau.
- Bestehende Test-/Diagnosepfade bleiben vorerst erhalten und werden erst nach stabilem Produktivtest gezielt reduziert.
