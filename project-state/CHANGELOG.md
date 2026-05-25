# CHANGELOG

## STEP442 – VIP Bus-First Testauswertung / Status Cleanup

- Sound-System auf `0.1.19` erhöht.
- VIP-Modul auf `1.8.25` erhöht.
- Feature auf `vip_bus_first_status_cleanup` gesetzt.
- `sound_system.js` pflegt jetzt `state.soundBusCommand.lastSoundId`.
- Direkte Datei-Payloads setzen im Command-Status `lastSoundId` auf die Datei, z. B. `vip/adoredpenny.mp3`.
- `recentCommands` erhält für direkte Datei-Payloads zusätzlich `file`.
- Reset leert `lastSoundId` sauber.
- Keine produktive Bus-Umschaltung.
- Keine DB-Migration.
