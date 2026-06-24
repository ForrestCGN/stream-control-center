# START HERE FOR NEW CHAT - stream-control-center / Remote Dashboard Agent Planung

Stand: RDAP_UI2_READONLY_COMFORT
Datum: 2026-06-24

## Zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP_UI1_LIVE_CONFIRMED.md
docs/current/RDAP_DEPLOY_RUNBOOK.md
```

## Aktueller Stand

```text
RDAP_UI2_READONLY_COMFORT
```

UI2 ist ein reiner Frontend-Komfort-Step für die bestehende read-only Remote-Modboard-Seite.

## Betroffene Dateien

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
```

## Inhalt

- Auto-Refresh alle 30 Sekunden
- letzte Aktualisierung sichtbar
- Countdown bis nächster Auto-Refresh
- Schnellstatus-Leiste
- Endpoint-Statuskarte
- bessere Fehlerbox bei API-Ausfall
- manueller Refresh bleibt erhalten

## Live-Basis

```text
Remote-Modboard public read-only UI:
https://mods.forrestcgn.de/

Remote-Modboard public read-only API:
https://mods.forrestcgn.de/api/remote/

Interner Service:
127.0.0.1:3010

Systemd:
scc-remote-modboard.service
```

## Deploy

Standard-Deploy-Script:

```text
tools/remote-modboard-deploy.sh
```

Webserver-Deploy:

```bash
sudo bash tools/remote-modboard-deploy.sh RDAP_UI2_READONLY_COMFORT dev
```

## Weiterhin verboten

- kein Login aktivieren
- kein Twitch-OAuth aktivieren
- keine Cookies setzen
- keine Sessions erstellen
- keine Session-Verlaengerung
- kein last_seen_at Update
- keine produktiven DB-Writes
- keine Migration
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets ins Repo, Frontend, Logs oder Chat
