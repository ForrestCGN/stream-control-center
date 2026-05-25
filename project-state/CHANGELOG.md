# CHANGELOG

## STEP445 – VIP Bus-First Produktiv-Schalter vorbereitet

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.27` angehoben.
- Feature auf `vip_bus_first_productive_switch_prepared` gesetzt.
- Neues vorbereitendes Setting ergänzt: `vipBusFirstProductiveEnabled`.
- Status-/Guard-Ausgaben um Produktiv-Schalter-Felder ergänzt:
  - `productiveSwitch`
  - `productiveSwitchAvailable`
  - `productiveSwitchConfiguredEnabled`
  - `productiveSwitchEffectiveEnabled`
  - `productiveSwitchSafetyLocked`
- Der Schalter ist in STEP445 bewusst sicherheitsgesperrt und effektiv nicht aktiv.
- Kein produktiver Bus-Default.
- Kein normaler Twitch-Command-Umbau.
- Keine Änderung am Sound-System-Code gegenüber STEP442/STEP443.
- Keine DB-Migration.
- Kein Dashboard-Umbau.
