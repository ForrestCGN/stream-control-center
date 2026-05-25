# Current System Status – STEP441

STEP441 prepares an explicit VIP Bus-First admin test path.

## Changed
- `backend/modules/vip_sound_overlay.js`
- VIP module version: `1.8.24`
- Feature: `vip_bus_first_sound_resolve_fix`
- Admin test route can explicitly request `busFirstTest=true` together with `vipBusMode=bus_enabled` and an existing VIP sound file.
- Normal Twitch VIP/Mod command remains unchanged and protected.

## Safety
- Normal productive VIP flow remains `legacy_sound_system_api`.
- Bus-First is only available through the explicit admin test route.
- No normal chat command is switched to Bus-First.
- No DB migration.
- `consumeDaily=false` still avoids daily usage writes in admin tests.


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
