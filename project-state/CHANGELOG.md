# CHANGELOG – Shot-Alarm STEP 1

## 2026-06-18 – SHOT-ALARM-1

Added:

- `backend/modules/shot_alarm.js`
- `config/shot_alarm.json`
- `htdocs/dashboard/modules/shot_alarm.js`
- `htdocs/dashboard/modules/shot_alarm.css`
- `htdocs/overlays/shot_alarm/shot_alarm_overlay.html`
- Dashboard-Registration in `htdocs/dashboard/app.js`
- Dashboard-HTML/CSS/Script-Einbindung in `htdocs/dashboard/index.html`
- Doku `docs/modules/shot_alarm.md`
- Handoff `docs/current/CURRENT_CHAT_HANDOFF_SHOT_ALARM_1.md`

Changed:

- Dashboard bekommt neuen Menüpunkt `Shot-Alarm` im Control-Bereich.

Unchanged:

- Twitch-Events, Loyalty, Alerts, Ko-fi, Tipeee, Sound-System und produktive DB bleiben unverändert.

- STEP_SHOT_ALARM_1_BITS_BLOCKS: Bits-Regel korrigiert: je volle 1000 Bits ein 50/50-Wurf; je volle 10000 Bits ein sicherer Shot; Rest-1000er bleiben 50/50.
