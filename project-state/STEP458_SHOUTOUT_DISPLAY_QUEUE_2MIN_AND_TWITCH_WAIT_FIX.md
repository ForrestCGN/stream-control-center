# STEP458_SHOUTOUT_DISPLAY_QUEUE_2MIN_AND_TWITCH_WAIT_FIX

## Ziel

Das Clip-Shoutout-/SO-System wartet jetzt auch bei den Shouti-Anzeigen selbst 2 Minuten zwischen zwei Starts. Zusätzlich wird der Twitch-Fehler "not streaming live or no viewers" nicht mehr als harter Fehler behandelt, sondern als Wartestatus für die offizielle Shoutout-Queue.

## Geändert

- `backend/modules/clip_shoutout.js`
  - Runtime-Version: `0.2.1`
  - persistente SQLite-Tabelle `clip_shoutout_display_queue`
  - Shouti-Anzeige-Queue mit `displayCooldownMs: 120000`
  - `!so @user` nimmt den Shouti auf und queued ihn
  - nächster Shouti startet frühestens 2 Minuten nach dem vorherigen Shouti-Start und nicht parallel
  - offizieller Twitch-Shoutout wird weiterhin nach Anzeige-Ende in die Official-Queue gelegt
  - Twitch-Fehler `not streaming live / no viewers` wird zu `waiting_stream_live`
  - neue Event-Bus-Events für Display-Queue und Twitch-Wait
- `htdocs/dashboard/modules/clip_shoutout.js`
  - Anzeige-Queue + offizielle Queue sichtbar
  - Display-Cooldown konfigurierbar
- `htdocs/dashboard/modules/clip_shoutout.css`
  - Styling für beide Queue-Tabellen

## Neue/erweiterte API

- `GET /api/clip-shoutout/status`
- `GET /api/clip-shoutout/queue`
  - enthält jetzt `displayQueue` und `officialQueue`
- `POST /api/clip-shoutout/display-queue/remove`
- `POST /api/clip-shoutout/display-queue/retry`
- bestehend weiter:
  - `POST /api/clip-shoutout/queue/remove`
  - `POST /api/clip-shoutout/queue/retry`
  - `GET /api/clip-shoutout/official/auth-status`

## Event-Bus

Channel: `shoutout.system`

Neue/erweiterte Actions:

- `shoutout.display.queued`
- `shoutout.display.waiting_cooldown`
- `shoutout.display.started`
- `shoutout.display.finished`
- `shoutout.display.queue_finished`
- `shoutout.display.failed`
- `shoutout.official.waiting_stream_live`

## Nicht geändert

- Sound-System
- Alert-System
- VIP-System
- Twitch-Modul
- bestehende Clip-Erstellung
- SQLite wird nur additiv erweitert, nicht ersetzt
