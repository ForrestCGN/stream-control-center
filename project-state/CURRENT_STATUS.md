# CURRENT_STATUS

## STEP464 aktiv

Clip-Shoutout / VSO läuft mit Timeline-Tracking und Streamtag-Limit:

- Modul: `clip_shoutout`
- Runtime-Version: `0.2.7`
- Test-Command bleibt: `!vso`
- Display-Queue aktiv
- Display-Cooldown: 120 Sekunden nach Ende der Anzeige
- Direkter Chat-Command-Bypass aktiv
- Offizielle Twitch-Shoutout-Chatmeldungen bleiben im Testmodus stumm
- Event-Bus bleibt aktiv: `shoutout.system`

## Neu in STEP464

- `GET /api/clip-shoutout/timeline` zeigt pro Shouti:
  - angefordert / queued
  - Anzeige verfügbar / gestartet / beendet
  - offizieller Twitch-Shoutout queued / gesendet / Fehler
- `clip_shoutout_display_queue` speichert `stream_day_id` und Override-Infos.
- `clip_shoutout_official_queue` und `clip_shoutout_official_history` speichern `display_queue_id`.
- Pro Streamtag ist ein Zielkanal standardmäßig nur einmal erlaubt.
- Override: `!vso @user --force`.

## Nächster Test

```text
!vso @urlug
!vso @urlug
!vso @urlug --force
```

Danach Timeline prüfen.
