# CURRENT_STATUS

Aktueller vorbereiteter Stand: STEP442 – VIP Bus-First Testauswertung / Status Cleanup.

- VIP-Modul: `1.8.25`
- Sound-System: `0.1.19`
- Feature: `vip_bus_first_status_cleanup`

STEP441 hat den Play-Test-Resolve für direkte VIP-Dateien repariert. STEP442 ergänzt die Diagnose, damit `stats.lastSoundId` im Sound-System-Command-Status bei direkten Datei-Payloads nicht leer bleibt, sondern die getestete Datei zeigt.

Der produktive VIP-Flow bleibt `legacy_sound_system_api`.
