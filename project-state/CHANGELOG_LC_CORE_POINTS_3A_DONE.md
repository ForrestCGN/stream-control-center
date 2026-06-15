# Changelog – LC-CORE-POINTS-3A

Stand: 2026-06-15

## LC-CORE-POINTS-3A – Loyalty abonniert Twitch Events als Bonus-Events

### Geändert

- `backend/modules/loyalty.js`
  - Version 0.1.15 -> 0.1.16
  - neuer Statusblock `twitchEventBonusBinding`
  - neuer Bus-Subscriber `loyalty:twitch.events:bonus_events`
  - Mapping von Twitch-EventBus-Events auf Loyalty-Eventtypen
  - Übergabe an vorhandenes `recordEventBonus()`

### Nicht geändert

- `backend/modules/twitch_events.js`
- `backend/modules/alert_system.js`
- Dashboard
- Overlays
- Streamer.bot
- produktive SQLite
- Donation/Tip

### Tests / Bestätigung

- `/api/loyalty/status` zeigt Version 0.1.16.
- `/api/loyalty/status` zeigt `twitchEventBonusBinding.installed=true`.
- `errors=0` im neuen Binding.
