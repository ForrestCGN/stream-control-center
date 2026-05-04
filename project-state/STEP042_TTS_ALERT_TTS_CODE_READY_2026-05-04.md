# STEP042 - TTS Alert-TTS Code Ready

Stand: 2026-05-04

## Zweck

Dieser STEP beschreibt den vorbereiteten Code-Stand fuer den ersten echten TTS-/Alert-TTS-Umbau.

Wichtig: Die grossen Code-Dateien konnten ueber den GitHub-Connector nur gekuerzt gelesen werden. Die Bearbeitung erfolgte deshalb auf Basis der von Forrest hochgeladenen vollstaendigen Dateien. Die fertigen Dateien liegen als ZIP mit echten Zielpfaden vor.

## Vorbereitete Dateien

- `backend/modules/tts_system.js`
- `backend/modules/alert_system.js`
- `htdocs/overlays/_overlay-alerts-v2.html`

## ZIP

- `STEP042_TTS_ALERT_TTS_CODE_READY_2026-05-04.zip`

Inhalt mit Zielpfaden:

- `backend/modules/tts_system.js`
- `backend/modules/alert_system.js`
- `htdocs/overlays/_overlay-alerts-v2.html`
- `project-state/STEP042_TTS_ALERT_TTS_CODE_READY_2026-05-04.md`

## TTS-System Aenderungen

### Neue Helper-/DB-Basis

`tts_system.js` nutzt vorbereitet:

- `helper_config.js`
- `helper_media.js`
- `helper_settings.js`
- `backend/core/database.js`

### Neue DB-Tabellen

Migrationssicher:

- `tts_events`
- `tts_usage_daily`
- `tts_settings` ueber `helper_settings.js`

### Neue Routen

- `GET /api/tts/settings`
- `POST /api/tts/settings/upsert`
- `GET /api/tts/events`
- `GET /api/tts/stats`
- `GET/POST /api/tts/prepare-alert`
- `GET/POST /api/tts/synthesize`

Bestehende TTS-Routen bleiben erhalten.

## Alert-System Aenderungen

`liveAlert` erhaelt vorbereitet:

- `alertTtsEnabled`
- `alertTtsPrepareUrl`
- `alertTtsTimeoutMs`
- `alertTtsDelayAfterSoundMs`
- `alertTtsOutroBufferMs`

Beim Verarbeiten eines Alerts wird bei aktiver Regel-TTS die TTS-Datei vor dem Anzeigen vorbereitet. Die echte TTS-Dauer verlaengert die Alert-Dauer.

## Overlay-Aenderung

`_overlay-alerts-v2.html` enthaelt ein separates Audio-Element fuer Alert-TTS:

- `#ttsSound`

Alert-TTS wird im Alert-Overlay abgespielt, nicht im normalen TTS-Overlay.

## Syntaxchecks

Lokal erfolgreich:

- `node --check /mnt/data/tts_system.js`
- `node --check /mnt/data/alert_system.js`

## Testplan

Nach Einspielen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/settings" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/stats" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/prepare-alert?text=Hallo%20Forrest%2C%20das%20ist%20ein%20Alert%20TTS%20Test&user=ForrestCGN" | ConvertTo-Json -Depth 10
```

Erwartung fuer Prepare:

- `ok = true`
- `audioUrl` vorhanden
- `durationMs > 0`

## Hinweise

- Keine Funktionalitaet entfernt.
- Chat-TTS bleibt erhalten.
- JSON-Dateien bleiben als Fallback/Import erhalten.
- Keine Secrets und keine SQLite-Datei enthalten.
- Sound-System wurde in diesem Schritt nicht veraendert.
