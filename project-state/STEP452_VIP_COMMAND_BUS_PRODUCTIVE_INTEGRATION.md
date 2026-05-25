# STEP452 – VIP Command Bus Productive Integration

## Ziel
Den VIP-Sound-Command sauber im bestehenden Node-Command-System absichern und den erfolgreichen produktiven Bus-Stand dokumentieren.

## Ausgangslage
Der direkte Backend-Test hatte bereits gezeigt, dass der VIP-Produktivpfad über den Sound-Bus funktioniert. Im Chat passierte zunächst nichts, weil `vip` nicht in `command_definitions` registriert war.

Live wurde `vip` anschließend per `/api/commands/upsert` registriert und der Bus-Status bestätigte den produktiven Erfolg:

```text
productivePlayChecks: 2
productivePlayOk: 2
productivePlayFailed: 0
lastSoundId: vip/adoredpenny.mp3
lastProductiveBusError: leer
```

## Umsetzung
`backend/modules/commands.js` wurde ergänzt:

- neue Catalog-Kategorie `vip_sound`
- Action `vip_sound.vip`
- Default-Seed für `vip`
- Alias `vipsound`
- Zielroute `/api/vip-sound/command`
- `permissionLevel: everyone`, weil das VIP-Modul den Zieluser bzw. Sounduser prüft

## Produktiver Flow

```text
!vip @adoredpenny
→ twitch_presence.js
→ commands.handleChatMessage(...)
→ commands.js
→ command_definitions: vip
→ POST /api/vip-sound/command
→ VIP-Modul
→ POST /api/sound/eventbus/command/play
→ sound_system.js
→ Sound startet
```

## Nicht geändert
- Keine neue Chat-Architektur.
- Kein Streamer.bot-Command.
- Keine neue Sound-Bus-Route.
- Keine DB-Migration.
- Kein Dashboard-Umbau.
- Keine bestehende Funktionalität entfernt.

## Test / Abschluss

```powershell
cd D:\Git\stream-control-center

node --check backend\modules\commands.js
node --check backend\modules\vip_sound_overlay.js
node --check backend\modules\sound_system.js

.\stepdone.cmd "STEP452 VIP Command Bus Productive Integration"
```

## Statusprüfung

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status"
$s | Select-Object productiveVipFlow,normalChatCommandUsesBusFirst,productiveSwitchEffectiveEnabled,productiveSwitchSafetyLocked,productiveEntryPointChanged,legacyVipFlow
$s.stats | Select-Object productivePlayChecks,productivePlayOk,productivePlayFailed,lastError,lastSoundId,lastProductiveBusError
```
