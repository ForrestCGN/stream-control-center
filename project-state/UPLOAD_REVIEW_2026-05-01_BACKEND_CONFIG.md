# Upload Review - backend.zip + config.zip

Stand: 2026-05-01

## Wichtig

Lokales Hauptverzeichnis bleibt:

`D:\Streaming\stramAssets\`

Das Repository spiegelt dieses Verzeichnis direkt. Es wird kein extra Ordner `StreamAssets` oder `stramAssets` im Repo angelegt.

## Gepruefte Uploads

- `backend.zip`
- `config.zip`

## Backend-Upload erkannt

Enthaltene sichere Quellcode-Bereiche:

```text
backend/server.js
backend/core/*.js
backend/modules/*.js
backend/modules/helpers/*.js
```

Nicht blind ins Repo uebernehmen:

```text
backend/data/app.sqlite
backend/modules/*.bak*
backend/modules/*.old
backend/data/* runtime state
```

Grund:

- SQLite gehoert nicht ins Repo.
- `.bak`/`.old` sind Altstaende und koennen spaeter Verwirrung erzeugen.
- Runtime-State muss lokal bleiben oder separat als Beispiel/Schema dokumentiert werden.

## Config-Upload erkannt

Sichere bzw. voraussichtlich repo-taugliche Config-Bereiche:

```text
config/challenge_system.json
config/clip_system.json
config/discord_channels.json
config/hug_system.json
config/message_rotator.json
config/scene_aliases.json
config/security.json
config/tagebuch.json
config/tools.json
config/tts_bans.json
config/tts_config.json
config/tts_messages.json
config/start_overlay.json
config/alert_system.json
config/twitch_alerts.json
config/dashboard_*.json
config/obs_dashboard.json
config/streamdesk.json
config/twitch_dashboard_auth.json
config/messages/*.json
config/secrets/.env.example
```

Nicht ins Repo uebernehmen:

```text
config/google_tts_service_account.json
```

Grund:

Diese Datei enthaelt einen echten Google-Service-Account-Private-Key. Sie darf nicht ins Repository.

## Sicherheitswarnung

`config/google_tts_service_account.json` enthaelt einen echten privaten Schluessel. Auch wenn er nicht ins Repo uebernommen wird, sollte dieser Key in Google Cloud rotiert bzw. ersetzt werden, weil er in einen Upload gelangt ist.

## Naechster Repo-Schritt

1. Backend-Code bereinigt in `dev` uebernehmen.
2. Configs bereinigt in `dev` uebernehmen.
3. Dashboard-/htdocs-Stand separat uebernehmen.
4. Danach `project-state/CURRENT_STATUS.md` auf den echten Repo-Stand aktualisieren.

## Keine Secrets ins Repo

Weiterhin verboten:

```text
.env
.env.*
*.sqlite
*.db
tokens/
secrets/
config/google_tts_service_account.json
Discord Webhook URLs
Twitch Tokens
Client Secrets
OAuth Refresh Tokens
```
