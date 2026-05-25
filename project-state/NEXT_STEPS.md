# NEXT STEPS

Recommended next step:

- STEP441: Validate Bus-First admin test output and decide whether the next controlled step should add a guarded Bus-First mode switch for broader testing.


## STEP441 – VIP Bus-First Sound Resolve Fix

Stand: 2026-05-25

### Ziel
Der explizite VIP Admin-Test mit `busFirstTest=true` soll vorhandene VIP-Dateien wie `vip/adoredpenny.mp3` im Sound-System-Play-Test korrekt auflösen.

### Befund aus STEP440
Der VIP-Payload enthielt eine gültige Datei (`file: vip/adoredpenny.mp3`), aber der Sound-System-Play-Test scheiterte mit `Sound wurde nicht gefunden`, weil `normalizePlayRequest` zuerst einen gesetzten `soundId` als Preset sucht.

### Umsetzung STEP441
- `backend/modules/sound_system.js` auf Version `0.1.18` erhöht.
- Sound-Bus-Command Play-Test/Dry-Run akzeptiert jetzt direkte Datei-Referenzen (`file`, `soundFile`, `relativeFile`, `relativePath`).
- Bei direkter Datei wird für `normalizePlayRequest` der Preset-`soundId` geleert, damit die bestehende Datei-Auflösung unter `soundsBaseDir` greift.
- Originaler Sound-Identifier bleibt diagnostisch in `meta.soundBusCommandOriginalSoundId`.
- `backend/modules/vip_sound_overlay.js` auf `1.8.24` / `vip_bus_first_sound_resolve_fix` aktualisiert.

### Bewusst nicht geändert
- Kein produktiver Bus-Default.
- Kein Umbau normaler Twitch-Commands.
- Keine DailyUsage bei Admin-Test `consumeDaily=false`.
- Keine DB-Migration.
- Kein Dashboard-Umbau.
