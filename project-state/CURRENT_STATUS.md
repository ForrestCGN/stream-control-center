# CURRENT_STATUS – Shot-Alarm STEP 1

Stand: 2026-06-18

## Status

`Shot-Alarm` wurde als neues Events-Modul vorbereitet.

Technisch:

- Modul: `shot_alarm`
- Backend-Version: `0.1.1`
- Build: `STEP_SHOT_ALARM_1_PAYMENT_50_50`
- Dashboard-Kategorie: `Control` / Events-nahe Steuerung
- Overlay: `/overlays/shot_alarm/shot_alarm_overlay.html`

## Enthalten

- Backend-Modul mit Bus-Subscription auf Twitch-Support-Events
- Config-Datei mit Default-Regeln
- Dashboard-Seite mit Status, Config, Tests und Verlauf
- Overlay im CGN-Neonstil
- Sound-System-Aufruf über `/api/sound/play` mit generiertem Beep als Default
- Resub-Dedupe-Puffer für normale Sub-Events

## Nicht geändert

- `twitch_events.js`
- `twitch.js`
- `loyalty.js`
- `alert_system.js`
- `kofi.js`
- `tipeee.js`
- `sound_system.js`
- produktive SQLite-Datenbank

## Achtung

Ko-fi/Tipeee-Regel ist vorbereitet, produktiv aber erst sauber nutzbar, wenn die Payment-Module neutrale Payment-Bus-Events senden oder gezielt angebunden werden.
