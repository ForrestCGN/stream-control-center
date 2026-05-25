# CURRENT_SYSTEM_STATUS

## Clip-Shoutout / VSO

Aktueller Reparaturstand: STEP462

- `clip_shoutout.js` Runtime-Version: `0.2.6`
- Test-Command: `!vso`
- Display-Queue: aktiv
- Display-Cooldown: 120 Sekunden nach Anzeige-Ende
- Event-Bus: `shoutout.system`
- Direkter Chat-Command-Bypass: aktiv

Ziel: Der echte Twitch-Chat-Command soll dieselbe Modulroute nutzen wie der erfolgreiche API-Test auf `/api/clip-shoutout/run`.

## STEP463

- Clip-Shoutout-Testmodus: Chatmeldungen reduziert.
- Offizielle Twitch-Shoutout-Folgeprozess-Meldungen sind stummgeschaltet.
- `!vso` bleibt Test-Command.
