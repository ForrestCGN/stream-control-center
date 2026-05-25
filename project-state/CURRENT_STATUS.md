# CURRENT_STATUS

Aktueller vorbereiteter Stand: STEP443 – VIP Bus-First optionaler Admin-Test ohne Legacy-Fallback.

- VIP-Modul: `1.8.26`
- Sound-System: `0.1.19`
- Feature: `vip_bus_first_no_legacy_admin_test`

STEP442 war erfolgreich: direkte Datei-Payloads erscheinen im Sound-System-Command-Status mit `lastSoundId`, z. B. `vip/adoredpenny.mp3`.

STEP443 ergänzt den expliziten Admin-Test um `noLegacyFallback=true`/`busFirstOnly=true`, damit der Bus-First-Testpfad separat bewertet werden kann und die Antwort eindeutig zeigt, dass kein Legacy-Fallback verwendet wurde.

Der normale Twitch-Command und der produktive VIP-Flow bleiben unverändert auf `legacy_sound_system_api`.
