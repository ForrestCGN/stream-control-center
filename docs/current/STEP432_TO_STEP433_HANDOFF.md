# STEP432 → STEP433 Übergabe

## Kurzstatus
STEP432 ist abgeschlossen. VIP hat jetzt einen vorbereiteten Bus-Modus-Schalter mit den Modi `legacy`, `shadow`, `play_test`, `bus_enabled`.

## Geprüfter Stand
- `vip_sound_overlay.js` Version: `1.8.15`
- Feature: `vip_sound_bus_mode_preparation`
- Sound-System Version: `0.1.17`
- Sound Feature: `sound_bus_command_play_test_layer`

## Bestanden
Die Mode-Route existiert und akzeptiert gültige Modi:

```text
/api/vip-sound/eventbus/sound-command/mode
/api/vip-sound-overlay/eventbus/sound-command/mode
```

`mode?mode=shadow` antwortet korrekt mit:

```text
mode: shadow
vipBusMode: shadow
effectiveVipFlow: legacy_sound_system_api
productiveEntryPointChanged: false
queueTouched: false
audioTouched: false
dailyUsageTouched: false
```

## Offener Punkt für STEP433
Nach dem Setzen von `shadow` zeigt die Statusroute wieder `vipBusMode: legacy`, obwohl `recentCommands` den Shadow-Set korrekt enthält.

Das bedeutet: Der Runtime-Modus wird von der Mode-Route akzeptiert, aber nicht sauber in dem State gehalten, aus dem die Statusroute liest.

## STEP433-Ziel
`vipBusMode` muss nach Moduswechsel stabil im Status sichtbar sein:

```text
mode?mode=shadow
→ status.vipBusMode: shadow

mode?mode=play_test
→ status.vipBusMode: play_test
```

Kein produktiver Bus-Flow in STEP433. Produktiv bleibt weiter:

```text
legacy_sound_system_api
```

## Sicherheit
Weiterhin nicht ändern:

```text
kein produktiver VIP-Bus-Flow
kein automatischer Soundstart über Bus
kein Alert-Flow
kein Bundle/TTS-Flow
keine Overlay-Steuerung
keine DB-Migration
```
