# START HERE FOR NEW CHAT - stream-control-center / Remote Dashboard Agent Planung

Stand: RDAP_AUTH1_TWITCH_LOGIN_GATED
Datum: 2026-06-24

## Aktueller Fokus

```text
RDAP_AUTH1_TWITCH_LOGIN_GATED
```

Twitch-Login ist vorbereitet, aber ohne Env-Gates/Secrets deaktiviert.

## Wichtig

Ohne bewusste Env-Aktivierung bleibt OAuth HTTP 403.

Aktivierung braucht:

```text
AUTH_ENABLED=true
TWITCH_OAUTH_ENABLED=true
SESSION_ENABLED=true
AUTH_SESSION_WRITE_ENABLED=true
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
SESSION_SECRET=...
OAUTH_STATE_SECRET=...
```

## Weiterhin nicht erlaubt

- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets ins Repo
