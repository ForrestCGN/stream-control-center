# START HERE FOR NEW CHAT - stream-control-center / Remote Dashboard Agent Planung

Stand: RDAP_UI2_READONLY_COMFORT_LIVE_CONFIRMED
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
docs/current/RDAP_UI2_READONLY_COMFORT_LIVE_CONFIRMED.md
```

## Aktueller bestätigter Stand

```text
RDAP_UI2_READONLY_COMFORT_LIVE_CONFIRMED
```

## Live sichtbar bestätigt

```text
https://mods.forrestcgn.de/
```

Sichtbar bestätigt:

- Service online
- Auto-Refresh sichtbar
- letzte Aktualisierung sichtbar
- Schnellstatus sichtbar
- Read-only Hinweis sichtbar
- Writes disabled
- OAuth disabled
- Agent disabled

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

Deploy-Wahrheit:

```text
/opt/stream-control-center ist kein Git-Repository.
GitHub/dev -> _deploy_tmp -> _runtime_tmp Backup -> rsync remote-modboard -> Restart -> Readiness -> Tests
```

## Nächster Fokus

Option A:

```text
RDAP_UI3_READONLY_DETAILS_OR_FILTERS
```

Option B:

```text
RDAP_AUTH_LOGIN_OAUTH_PLAN
```

Nur planen, noch nicht aktivieren.

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
