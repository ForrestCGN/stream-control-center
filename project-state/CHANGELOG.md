# CHANGELOG

## STEP467_STREAM_STATUS_REFRESH_SOURCE

- `backend/modules/stream_status.js` auf Runtime-Version `0.1.1` erhöht.
- HTTP/HTTPS-Fallback für stale oder fehlende Live-Status-Dateien ergänzt.
- `/api/stream-status/status` und `/api/stream-status/refresh` können den lokalen Twitch-Backend-Endpunkt aktiv abfragen.
- Neue Statusfelder ergänzt: `apiUrl`, `apiEnabled`, `apiError`, `checkedViaApiAt`, `upstreamSource`.
- Bestehende dateibasierte Quelle bleibt erhalten und wird bevorzugt, wenn sie frisch und bekannt ist.
- Keine Änderung an `clip_shoutout.js`, Display-Queue, `!vso`, Streamtag-Limit oder Chatmeldungen.

## STEP468 - Stream Status Auto Refresh

- `stream_status` auf `0.1.2` angehoben.
- Twitch-API als bevorzugte Live-Status-Quelle aktiviert.
- Auto-Refresh mit konfigurierbaren Intervallen ergänzt.
- Datei-basierte Twitch-Statusquellen bleiben als Fallback erhalten.
- `getCurrentStatus()` für synchrone Modulnutzung stabilisiert, damit frischer API-Status nicht durch stale Datei-Refresh überschrieben wird.

## STEP469 - Shoutout Dashboard Module

- Eigenes Dashboard-Modul für `clip_shoutout` ergänzt.
- `htdocs/dashboard/index.html` lädt `shoutout.css` und `shoutout.js` und enthält das Panel `#shoutoutModule`.
- `shoutout.js` registriert sich dynamisch im Dashboard, ohne `app.js` zu ersetzen.
- Dashboard zeigt Display-Queue, Official-Queue, Timeline und Official Live-Gate mit zentralem Streamstatus.
- Kleine Dashboard-Testauslösung nutzt die vorhandene Route `/api/clip-shoutout/run`.
- Keine Änderung an Backend, Streamstatus, Command-Logik, Chatmeldungen oder Sound-System.
