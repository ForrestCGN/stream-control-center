# CURRENT_STATUS

Aktueller Stand: STEP447 – VIP Bus-First Cleanup & Konsolidierung.

- VIP-Modul: `1.8.29`
- Sound-System: `0.1.19`
- Feature: `vip_bus_first_cleanup_consolidation`

STEP447 baut keinen neuen Testpfad. Der bestehende und bestandene Bus-First-No-Legacy-Admin-Testpfad bleibt erhalten, wird aber im Status konsolidiert und klar als Kandidat markiert.

Wichtig:

- Normaler Twitch-Chat-Command bleibt unverändert.
- Produktiver VIP-Flow bleibt `legacy_sound_system_api`.
- `vipBusFirstProductiveEnabled` bleibt sichtbar, aber effektiv deaktiviert.
- Safety-Lock bleibt aktiv.
- Keine neue Route.
- Keine DB-Migration.
- Keine Änderung am Sound-System gegenüber STEP442/STEP443.
