# STEP224 - Twitch Event Simulator Dashboard (2026-05-11)

## Ziel

Dashboard-Modul zum lokalen Simulieren von Twitch-EventSub-Events eingebaut.

## Betroffene Dateien

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/twitch_events.js
htdocs/dashboard/modules/twitch_events.css
project-state/STEP224_TWITCH_EVENT_SIMULATOR_DASHBOARD_2026-05-11.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

## Umsetzung

- Neues Dashboard-Modul `twitch_events` registriert.
- Neues Panel `twitchEventsModule` eingebunden.
- Neue Moduldateien `twitch_events.js` und `twitch_events.css` angelegt.
- Modul nutzt bestehende Backend-Routen:
  - `GET /api/twitch/alerts/debug/presets`
  - `POST /api/twitch/alerts/debug/eventsub`
- Standardmaessig ist Dry-Run aktiv.
- Ergebnisanzeige zeigt Normalisierung, Alert-Result und Sub-Puffer.

## Bewusst nicht geaendert

```text
backend/modules/twitch.js
backend/modules/alert_system.js
Alert-Regeln
TTS-Logik
Sound-System
Loyalty
Kofi/Tipeee
Datenbank
```

## Test

- Dashboard oeffnen.
- Bereich Control auswaehlen.
- Kachel Twitch Events oeffnen.
- Preset auswaehlen und Dry-Run testen.
- Fuer echte Tests Dry-Run bewusst deaktivieren.
