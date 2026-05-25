# CURRENT_STATUS

Aktueller Stand: STEP446 – VIP Bus-First Productive Switch Config/Status vorbereitet, weiterhin deaktiviert und sicherheitsgesperrt.

- VIP-Modul: `1.8.28`
- Sound-System: `0.1.19`
- Feature: `vip_bus_first_productive_switch_config_status`

STEP446 macht den vorbereiteten Produktiv-Schalter `vipBusFirstProductiveEnabled` sauber im Status lesbar. Dabei werden Quelle, Wert, Default, Effective-Reason und Safety-Lock ausgewiesen.

Wichtig:

- Der Schalter ist im Default `false`.
- Der effektive Produktiv-Schalter bleibt in STEP446 immer `false`.
- `productiveSwitchSafetyLocked` bleibt `true`.
- Der normale Twitch-Command bleibt unverändert.
- Der produktive VIP-Flow bleibt `legacy_sound_system_api`.
- Der bestätigte Bus-First-No-Legacy-Admin-Testpfad aus STEP443 bleibt als Kandidat erhalten.
