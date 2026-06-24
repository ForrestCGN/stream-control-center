# START HERE FOR NEW CHAT - stream-control-center / Remote Dashboard Agent Planung

Stand: RDAP_AUTH1_TWITCH_LOGIN_LIVE_CONFIRMED
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
docs/current/RDAP_AUTH1_TWITCH_LOGIN_GATED.md
docs/current/RDAP_AUTH1_TWITCH_LOGIN_LIVE_CONFIRMED.md
```

## Aktueller Stand

```text
RDAP_AUTH1_TWITCH_LOGIN_LIVE_CONFIRMED
```

## Live bestätigt

```text
https://mods.forrestcgn.de/
```

Browser zeigte:

```text
Angemeldet als ForrestCGN
```

API-Status bestätigte:

```text
.auth.enabled = true
.auth.loginEnabled = true
.auth.twitchOAuth.effectiveEnabled = true
.auth.sessions.effectiveEnabled = true
```

## Sofort beachten

`SESSION_SECRET` und `OAUTH_STATE_SECRET` wurden im Chat sichtbar und müssen rotiert werden.

```bash
openssl rand -base64 48
openssl rand -base64 48
nano /etc/stream-control-center/remote-modboard.env
systemctl restart scc-remote-modboard.service
```

## Nächster Schritt

```text
RDAP_DASHBOARD1_PROTECTED_SHELL
```

Ziel:

- geschützte Dashboard-Shell
- eingeloggter User oben rechts
- Sidebar/Navigation
- erste read-only Seiten geschützt hinter Login
- Logout sichtbar
- keine Remote-Writes/Agent-Actions/OBS/Sound/Overlay/Command-Steuerung

## Dauerregeln

- GitHub/dev ist Source of Truth.
- Webserver Deploy über `tools/remote-modboard-deploy.sh`.
- `/opt/stream-control-center` ist kein Git-Repository.
- Keine Secrets ins Repo, Frontend, Logs oder Chat.
- Keine gefährlichen Actions nebenbei aktivieren.
