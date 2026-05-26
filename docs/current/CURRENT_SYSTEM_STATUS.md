# CURRENT_SYSTEM_STATUS

## Clip-Shoutout / VSO

Aktueller Stand: STEP464

- `clip_shoutout.js` Runtime-Version: `0.2.7`
- Test-Command: `!vso`
- Display-Queue: aktiv
- Display-Cooldown: 120 Sekunden nach Anzeige-Ende
- Event-Bus: `shoutout.system`
- Direkter Chat-Command-Bypass: aktiv
- Offizielle Twitch-Shoutout-Chatmeldungen: im Testmodus stumm

## STEP464

- Timeline-Tracking ergänzt: `/api/clip-shoutout/timeline`.
- Display-Shouti und offizieller Twitch-Shoutout werden über `display_queue_id` verknüpft.
- Streamtag-Limit ergänzt: ein Zielkanal standardmäßig nur einmal pro Streamtag.
- Override möglich über `!vso @user --force`.
- Streamtag ist Streamstart bis Streamende, mit Restart-Grace für Streamneustarts.

## Bewusst unverändert

- Keine Umstellung von `!vso` auf `!so`.
- Keine Sound-System-Änderung.
- Keine Dashboard-Änderung.
- Keine EventBus-Umstellung.
