# CURRENT_STATUS

Aktueller Stand: STEP445 – VIP Bus-First Produktiv-Schalter vorbereitet, standardmäßig deaktiviert und sicherheitsgesperrt.

- VIP-Modul: `1.8.27`
- Sound-System: `0.1.19`
- Feature: `vip_bus_first_productive_switch_prepared`

STEP445 ergänzt im VIP-Modul eine vorbereitete Status-/Config-Struktur für den späteren Produktiv-Schalter `vipBusFirstProductiveEnabled`.

Wichtig:

- Der Schalter ist im Default `false`.
- Der effektive Produktiv-Schalter bleibt in STEP445 immer `false`.
- `productiveSwitchSafetyLocked` bleibt `true`.
- Der normale Twitch-Command bleibt unverändert.
- Der produktive VIP-Flow bleibt `legacy_sound_system_api`.
- Der bestätigte Bus-First-No-Legacy-Admin-Testpfad aus STEP443 bleibt als Kandidat erhalten.
