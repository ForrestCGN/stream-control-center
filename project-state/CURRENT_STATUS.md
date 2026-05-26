# CURRENT_STATUS

## STEP468 - Stream Status Auto Refresh

- `backend/modules/stream_status.js` steht auf Runtime-Version `0.1.2`.
- Der zentrale Stream-Live-Status nutzt die lokale Twitch-API standardmäßig als Primärquelle.
- Legacy-Dateien `htdocs/data/twitch_stream_raw.json` und `htdocs/data/twitch_live_data.json` bleiben als Fallback erhalten.
- Auto-Refresh läuft standardmäßig alle 60 Sekunden, bei live/grace alle 30 Sekunden.
- Der Status wird im RAM und in SQLite gespeichert (`stream_status_state`, `stream_status_sessions`).
- Synchrone Konsumenten wie `clip_shoutout` bekommen den letzten zentralen Stand, ohne ihn durch stale Datei-Lesung zu überschreiben.

## STEP469 - Shoutout Dashboard Module

- Das Shoutout-System ist jetzt als eigenes Dashboard-Modul sichtbar.
- Neue Dashboard-Dateien:
  - `htdocs/dashboard/modules/shoutout.js`
  - `htdocs/dashboard/modules/shoutout.css`
- `htdocs/dashboard/index.html` lädt CSS/JS und enthält das Panel `#shoutoutModule`.
- Das Modul registriert sich im Community-Bereich und in den Favoriten.
- Das Dashboard zeigt Display-Queue, Official-Queue, Official Live-Gate, zentralen Streamstatus und Timeline.
- Kleine Testauslösung per Dashboard ist möglich, inklusive optionalem `--force` für das bestehende Streamtag-Limit.
- Keine Backend-Logik wurde geändert.
