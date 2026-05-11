# Upload Review - dashboard.tgz + htdocs.tgz

Stand: 2026-05-01

## Lokales Hauptverzeichnis

`D:\Streaming\stramAssets\`

Repo-Root spiegelt dieses Verzeichnis direkt.

## Gepruefte Uploads

- `dashboard.tgz`
- `htdocs.tgz`

## dashboard.tgz

Enthaelt den aktuellen Dashboard-Ordner:

```text
htdocs/dashboard/app.css
htdocs/dashboard/app.js
htdocs/dashboard/index.html
htdocs/dashboard/modules/adminconfigs.css
htdocs/dashboard/modules/adminconfigs.js
htdocs/dashboard/modules/alerts.css
htdocs/dashboard/modules/alerts.js
htdocs/dashboard/modules/controlhome.css
htdocs/dashboard/modules/controlhome.js
htdocs/dashboard/modules/obs.css
htdocs/dashboard/modules/obs.js
htdocs/dashboard/modules/streamdesk.css
htdocs/dashboard/modules/streamdesk.js
```

Diese Dateien sind repo-tauglich und sollen in `dev` uebernommen werden.

## htdocs.tgz

Enthaelt zusaetzlich:

```text
htdocs/alerts/alert.html
htdocs/dashboard/...
htdocs/data/...
htdocs/overlays/...
htdocs/public/fireworks_custom.js
htdocs/ws-client.js
htdocs/index.htm
```

## Repo-tauglich aus htdocs.tgz

```text
htdocs/alerts/alert.html
htdocs/dashboard/**/*
htdocs/overlays/*.html
htdocs/overlays/*.js
htdocs/overlays/*.css
htdocs/public/*.js
htdocs/ws-client.js
htdocs/index.htm
```

## Nicht blind ins Repo uebernehmen

```text
htdocs/data/*
htdocs/data/Screenshots/*
htdocs/data/*.backup
htdocs/overlays/*.alt
htdocs/overlays/*.new
```

Grund:

- `htdocs/data/*` enthaelt teilweise Runtime-State, Twitch-Rohdaten, aktuelle Channelinfos, TTS-State und lokale Datenstaende.
- `.alt`/`.new` sind Alt-/Zwischenstaende und koennen spaeter Verwirrung erzeugen.
- Screenshots/Bilder sind fuer den Code-Stand nicht noetig.

## Auffaellige Runtime-Dateien in htdocs/data

```text
htdocs/data/twitch_channelinfo.json
htdocs/data/twitch_live_data.json
htdocs/data/twitch_stream_raw.json
htdocs/data/twitch_user_data.json
htdocs/data/tts_state.json
htdocs/data/death_counter.json.backup
htdocs/data/songtitel.jpg
```

Diese bleiben lokal und werden nicht in den sauberen Repo-Stand uebernommen.

## Uebernahmeplan

1. Dashboard-Dateien aus `dashboard.tgz` nach `htdocs/dashboard/` in `dev` uebernehmen.
2. Danach sichere Overlay-/Public-Dateien aus `htdocs.tgz` uebernehmen.
3. `htdocs/data` nur spaeter gezielt als `.example.json` oder Dokumentation, nicht als Live-Daten.
4. Danach `project-state/CURRENT_STATUS.md` aktualisieren.
