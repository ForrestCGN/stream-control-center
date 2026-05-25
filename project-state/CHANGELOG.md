# CHANGELOG

## STEP446 – VIP Bus-First Productive Switch Config/Status

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.28` angehoben.
- Feature auf `vip_bus_first_productive_switch_config_status` gesetzt.
- `vipBusFirstProductiveEnabled` bleibt der vorbereitete Productive-Switch-Key.
- Status-/Guard-Ausgaben um Config-/Statusdetails erweitert:
  - `productiveSwitchSettingKey`
  - `productiveSwitchConfiguredSource`
  - `productiveSwitchConfiguredValue`
  - `productiveSwitchDefaultEnabled`
  - `productiveSwitchEffectiveReason`
  - `productiveSwitchSafetyLockReason`
  - `productiveSwitchConfigReadable`
  - `productiveSwitchStatusReadable`
  - `productiveSwitchConfigPath`
  - `productiveSwitchSettingsTable`
- Der Schalter ist in STEP446 weiterhin sicherheitsgesperrt und effektiv nicht aktiv.
- Kein produktiver Bus-Default.
- Kein normaler Twitch-Command-Umbau.
- Keine Änderung am Sound-System-Code gegenüber STEP442/STEP443.
- Keine DB-Migration.
- Kein Dashboard-Umbau.
