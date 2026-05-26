# STEP457 – Shoutout System Queue Dashboard EventBus

## Ziel
Das bestehende Clip-Shoutout-System wird als SO-System erweitert: `!so @user`, 90-Tage-Clip-Suche zuerst, offizieller Twitch-Shoutout nach Anzeige, Cooldown-Queue, Dashboard-API und Event-Bus-Events.

## Geändert
- `backend/modules/clip_shoutout.js`
  - Runtime-Version: `0.2.0`
  - Command: `so`
  - Aliases: `vso`, `clipso`, `videoso`
  - Clip-Suche startet mit 90 Tagen: `[90, 365, 0]`
  - offizielle Twitch-Shoutouts werden nach Anzeige in SQLite-Queue gelegt
  - globaler Cooldown: 120 Sekunden
  - Zielkanal-Cooldown: 3600 Sekunden
  - Event-Bus-Channel: `shoutout.system`
- `htdocs/dashboard/modules/clip_shoutout.js`
- `htdocs/dashboard/modules/clip_shoutout.css`

## Nicht geändert
- Sound-System Bus-First bleibt unverändert.
- Alert-System bleibt unverändert.
- VIP-System bleibt unverändert.
- Bestehende Clip-Erstellung bleibt unverändert.
- SQLite wird nur additiv erweitert.

## Neue APIs
- `GET /api/clip-shoutout/status`
- `GET /api/clip-shoutout/settings`
- `POST /api/clip-shoutout/settings`
- `GET /api/clip-shoutout/queue`
- `POST /api/clip-shoutout/queue/remove`
- `POST /api/clip-shoutout/queue/retry`
- `GET /api/clip-shoutout/official/auth-status`

## Event-Bus
- `shoutout.accepted`
- `shoutout.display.started`
- `shoutout.display.finished`
- `shoutout.official.queued`
- `shoutout.official.waiting_cooldown`
- `shoutout.official.sent`
- `shoutout.official.failed`

## Test
```bat
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP457 Shoutout System Queue Dashboard EventBus"
node --check backend\modules\clip_shoutout.js
```

Minimaler Status:
```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object module,moduleVersion,enabled,command
$s.config | Select-Object clipLookbackDays,clipSearchRangesDays
```
