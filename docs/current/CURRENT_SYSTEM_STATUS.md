# Current System Status – STEP440

STEP440 prepares an explicit VIP Bus-First admin test path.

## Changed
- `backend/modules/vip_sound_overlay.js`
- VIP module version: `1.8.23`
- Feature: `vip_bus_first_test_path_preparation`
- Admin test route can explicitly request `busFirstTest=true` together with `vipBusMode=bus_enabled` and an existing VIP sound file.
- Normal Twitch VIP/Mod command remains unchanged and protected.

## Safety
- Normal productive VIP flow remains `legacy_sound_system_api`.
- Bus-First is only available through the explicit admin test route.
- No normal chat command is switched to Bus-First.
- No DB migration.
- `consumeDaily=false` still avoids daily usage writes in admin tests.
