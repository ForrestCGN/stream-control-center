# CURRENT_SYSTEM_STATUS

## VIP Sound Overlay / Sound Bus

Aktueller Stand: STEP449.

- `vip_sound_overlay.js`: Version `1.8.31`
- Feature: `vip_productive_bus_access_target_hook_fix`
- `sound_system.js`: Version `0.1.20`
- Produktiver VIP-Pfad: `sound_bus_command`
- Legacy: nur Fallback bei Bus-Fehler

STEP449 behebt den produktiven Command-Hook vor dem Bus: Der echte `/api/vip-sound/command`-Flow wurde in STEP448 noch vor dem Bus durch `not_twitch_vip_or_mod` abgelehnt. Jetzt werden Rollen aus Command-Payloads und lokale Rollen-Fallbacks berücksichtigt.

Wichtig: Es wurde kein neuer Testpfad aufgebaut. Ziel ist der echte produktive Bus-Test.
